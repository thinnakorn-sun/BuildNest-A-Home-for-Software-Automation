'use strict';
/** QA-only simulation. No Stripe API, no network, no real entitlements, no credentials. */
const crypto = require('node:crypto');
const ALLOWED_CURRENCIES = new Set(['THB','USD']);
const ALLOWED_TYPES = new Set(['payment.succeeded','payment.failed','payment.refunded','payment.disputed']);
const MOCK_SIGNATURE_SECRET = 'qa-only-fixed-fixture-not-for-production';
const MAX_EVENT_AGE_SEC = 300;

const catalog = new Map([
  ['excel-automator',{productId:'excel-automator',available:true,price:{THB:99000,USD:3900}}],
  ['catalog-watch',{productId:'catalog-watch',available:true,price:{THB:69000,USD:2900}}],
  ['disabled-product',{productId:'disabled-product',available:false,price:{THB:10000,USD:300}}],
]);
function freshStore(){return {orders:new Map(),keys:new Map(),events:new Set(),entitlements:new Map(),next:0};}
function requireCondition(condition,message){if(!condition)throw new Error(message);}
function makeOrder(store,{userId,productId,currency,clientPrice,idempotencyKey}){
 requireCondition(typeof userId==='string'&&userId.length>0,'authentication required');
 requireCondition(typeof idempotencyKey==='string'&&/^[a-z0-9_-]{8,80}$/i.test(idempotencyKey),'invalid idempotency key');
 const p=catalog.get(productId);
 requireCondition(p&&p.available,'product unavailable');
 requireCondition(ALLOWED_CURRENCIES.has(currency),'invalid currency');
 requireCondition(Number.isSafeInteger(p.price[currency])&&p.price[currency]>0,'invalid configured price');
 if(clientPrice!==undefined)requireCondition(clientPrice===p.price[currency],'client price mismatch');
 const existing=store.keys.get(`${userId}:${idempotencyKey}`);
 if(existing){requireCondition(existing.userId===userId&&existing.productId===productId&&existing.currency===currency,'idempotency collision');return existing;}
 const id=`qa-order-${++store.next}`;
 const order={id,userId,productId,currency,amountMinor:p.price[currency],status:'pending',rightsIssued:0};
 store.orders.set(id,order);store.keys.set(`${userId}:${idempotencyKey}`,order);return order;
}
function payloadString(event){return JSON.stringify(event);}
function sign(event,when=1700000000,secret=MOCK_SIGNATURE_SECRET){
 const payload=payloadString(event);
 const signature=crypto.createHmac('sha256',secret).update(`${when}.${payload}`).digest('hex');
 return {payload,timestamp:when,signature};
}
function validateEnvelope(envelope,now=1700000000,secret=MOCK_SIGNATURE_SECRET){
 requireCondition(envelope&&typeof envelope.payload==='string'&&envelope.payload.length<1024*32,'invalid payload');
 requireCondition(Number.isInteger(envelope.timestamp)&&Math.abs(now-envelope.timestamp)<=MAX_EVENT_AGE_SEC,'stale webhook');
 requireCondition(typeof envelope.signature==='string'&&/^[0-9a-f]{64}$/i.test(envelope.signature),'invalid signature');
 const expected=crypto.createHmac('sha256',secret).update(`${envelope.timestamp}.${envelope.payload}`).digest();
 const provided=Buffer.from(envelope.signature,'hex');
 requireCondition(provided.length===expected.length&&crypto.timingSafeEqual(provided,expected),'invalid signature');
 let event;try{event=JSON.parse(envelope.payload)}catch{throw new Error('invalid JSON');}
 requireCondition(event&&typeof event==='object'&&!Array.isArray(event),'event must be object');
 requireCondition(typeof event.id==='string'&&/^[a-z0-9_-]{3,120}$/i.test(event.id),'invalid event id');
 requireCondition(ALLOWED_TYPES.has(event.type),'unsupported event');
 return event;
}
function receiveEvent(store,envelope,now=1700000000){
 const event=validateEnvelope(envelope,now);
 if(store.events.has(event.id))return {processed:false,reason:'duplicate'};
 const order=store.orders.get(event.orderId);requireCondition(order,'unknown order');
 requireCondition(order.currency===event.currency,'currency mismatch');
 requireCondition(order.amountMinor===event.amountMinor,'amount mismatch');
 requireCondition(event.userId===order.userId&&event.productId===order.productId,'order ownership or product mismatch');
 let reason='ok';
 if(event.type==='payment.succeeded'){
   if(order.status==='pending'){
      order.status='paid';order.rightsIssued++;
      store.entitlements.set(order.id,{userId:order.userId,productId:order.productId,active:true});
   } else reason='out-of-order-ignored';
 } else if(event.type==='payment.failed'){
   if(order.status==='pending')order.status='failed';else reason='out-of-order-ignored';
 } else if(event.type==='payment.refunded'||event.type==='payment.disputed'){
   if(order.status==='paid'||order.status==='refunded'||order.status==='disputed'){
      order.status=event.type==='payment.refunded'?'refunded':'disputed';
      const entitlement=store.entitlements.get(order.id);if(entitlement)entitlement.active=false;
   }else reason='out-of-order-ignored';
 }
 store.events.add(event.id);return {processed:true,reason};
}
function canDownload(store,orderId,userId){
 const order=store.orders.get(orderId),license=store.entitlements.get(orderId);
 return !!(order&&license&&order.userId===userId&&license.userId===userId&&license.active&&order.status==='paid');
}
module.exports={catalog,freshStore,makeOrder,sign,validateEnvelope,receiveEvent,canDownload};
