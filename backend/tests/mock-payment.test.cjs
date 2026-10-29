'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {freshStore,makeOrder,sign,receiveEvent,canDownload,validateEnvelope}=require('./mock-payment.cjs');
let seed=0;
function order(st=freshStore(),options={}){return makeOrder(st,{userId:'buyer-a',productId:'excel-automator',currency:'THB',idempotencyKey:`key_${String(++seed).padStart(9,'0')}`,...options});}
function event(o,type='payment.succeeded',options={}){return {id:`evt_${++seed}`,type,orderId:o.id,userId:o.userId,productId:o.productId,amountMinor:o.amountMinor,currency:o.currency,...options};}
function process(st,o,type='payment.succeeded',options={}){return receiveEvent(st,sign(event(o,type,options)));}
const rejects=(fn,regex)=>assert.throws(fn,regex);

test('catalog price authority is server-side and minor-unit integer',()=>{const st=freshStore();const o=order(st);assert.equal(o.amountMinor,99000);assert.equal(o.currency,'THB');});
test('USD pricing is an explicit catalog amount not FX conversion',()=>{const o=order(freshStore(),{currency:'USD'});assert.equal(o.amountMinor,3900);});
test('client cannot set discounted amount',()=>rejects(()=>order(freshStore(),{clientPrice:1}),/price mismatch/));
test('invalid currency is rejected',()=>rejects(()=>order(freshStore(),{currency:'BTC'}),/currency/));
test('nonexistent product is rejected',()=>rejects(()=>order(freshStore(),{productId:'ghost'}),/unavailable/));
test('disabled catalog entry cannot be purchased',()=>rejects(()=>order(freshStore(),{productId:'disabled-product'}),/unavailable/));
test('anonymous purchase attempt is rejected',()=>rejects(()=>order(freshStore(),{userId:''}),/authentication/));
test('idempotency key must be valid',()=>rejects(()=>order(freshStore(),{idempotencyKey:'x'}),/idempotency/));
test('same idempotency key gives same order without double charge simulation',()=>{const st=freshStore();const id='key_reused_0001';const a=order(st,{idempotencyKey:id});const b=order(st,{idempotencyKey:id});assert.strictEqual(a,b);assert.equal(st.orders.size,1);});
test('reused idempotency key for another product is blocked',()=>{const st=freshStore();const id='key_reused_0002';order(st,{idempotencyKey:id});rejects(()=>order(st,{idempotencyKey:id,productId:'catalog-watch'}),/collision/);});
test('pending payment never grants download rights',()=>{const st=freshStore();const o=order(st);assert.equal(o.status,'pending');assert.equal(canDownload(st,o.id,'buyer-a'),false);});
test('client redirect or success page cannot grant entitlement',()=>{const st=freshStore();const o=order(st);const fake={success:true,paymentStatus:'paid'};assert.ok(fake.success);assert.equal(canDownload(st,o.id,'buyer-a'),false);});
test('signed paid event creates exactly one entitlement',()=>{const st=freshStore();const o=order(st);process(st,o);assert.equal(o.status,'paid');assert.equal(o.rightsIssued,1);assert.equal(canDownload(st,o.id,'buyer-a'),true);});
test('same webhook event id cannot issue duplicate rights',()=>{const st=freshStore();const o=order(st);const e=sign(event(o));receiveEvent(st,e);assert.equal(receiveEvent(st,e).reason,'duplicate');assert.equal(o.rightsIssued,1);});
test('different success events still issue only once',()=>{const st=freshStore();const o=order(st);process(st,o);process(st,o);assert.equal(o.rightsIssued,1);});
test('invalid webhook signature is rejected',()=>{const st=freshStore();const o=order(st);const a=sign(event(o));a.signature='0'.repeat(64);rejects(()=>receiveEvent(st,a),/signature/);assert.equal(o.status,'pending');});
test('modified signed payload is rejected',()=>{const st=freshStore();const o=order(st);const a=sign(event(o));a.payload=a.payload.replace('99000','100');rejects(()=>receiveEvent(st,a),/signature/);});
test('expired event timestamp is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>receiveEvent(st,sign(event(o),1699999000)),/stale/);});
test('future event timestamp too far out is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>receiveEvent(st,sign(event(o),1700009000)),/stale/);});
test('unsigned event is rejected',()=>rejects(()=>validateEnvelope({payload:'{}',timestamp:1700000000}),/signature/));
test('webhook amount lower than order is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.succeeded',{amountMinor:o.amountMinor-100}),/amount/);});
test('webhook amount higher than order is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.succeeded',{amountMinor:o.amountMinor+100}),/amount/);});
test('webhook currency mismatch is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.succeeded',{currency:'USD'}),/currency/);});
test('webhook with different user is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.succeeded',{userId:'buyer-b'}),/ownership/);});
test('webhook with different product is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.succeeded',{productId:'catalog-watch'}),/ownership/);});
test('unknown order webhook is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.succeeded',{orderId:'other'}),/unknown order/);});
test('payment failure blocks entitlement',()=>{const st=freshStore();const o=order(st);process(st,o,'payment.failed');assert.equal(o.status,'failed');assert.equal(canDownload(st,o.id,o.userId),false);});
test('late success after failure does not issue entitlement',()=>{const st=freshStore();const o=order(st);process(st,o,'payment.failed');assert.equal(process(st,o).reason,'out-of-order-ignored');assert.equal(canDownload(st,o.id,o.userId),false);});
test('refund revokes downloads',()=>{const st=freshStore();const o=order(st);process(st,o);process(st,o,'payment.refunded');assert.equal(o.status,'refunded');assert.equal(canDownload(st,o.id,o.userId),false);});
test('dispute revokes downloads',()=>{const st=freshStore();const o=order(st);process(st,o);process(st,o,'payment.disputed');assert.equal(o.status,'disputed');assert.equal(canDownload(st,o.id,o.userId),false);});
test('delayed success after refund does not reactivate',()=>{const st=freshStore();const o=order(st);process(st,o);process(st,o,'payment.refunded');process(st,o);assert.equal(canDownload(st,o.id,o.userId),false);});
test('second user may not download other buyer files',()=>{const st=freshStore();const o=order(st);process(st,o);assert.equal(canDownload(st,o.id,'buyer-b'),false);});
test('nonexistent order cannot be downloaded',()=>assert.equal(canDownload(freshStore(),'invalid','buyer-a'),false));
test('event of unknown type is rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>process(st,o,'payment.successes'),/unsupported event/);});
test('bad JSON event is rejected',()=>{const a=sign({id:'evt_a',type:'payment.succeeded'});a.payload='{';rejects(()=>validateEnvelope(a),/signature/);});
test('missing event id rejected',()=>{const st=freshStore();const o=order(st);rejects(()=>receiveEvent(st,sign(event(o,'payment.succeeded',{id:''}))),/event id/);});
test('charge attempt cannot use NaN price',()=>rejects(()=>order(freshStore(),{clientPrice:NaN}),/price mismatch/));
test('large duplicate delivery burst grants exactly one right',()=>{const st=freshStore();const o=order(st);for(let i=0;i<500;i++)process(st,o);assert.equal(o.rightsIssued,1);assert.equal(st.entitlements.size,1);});
