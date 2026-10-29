import {PRODUCTS} from '@buildnest/contracts/catalog';
import type {Product} from '@buildnest/contracts';
// M1 source-of-truth is a typed, synthetic seed shared with Nest API. No real product inventory or payment.
export function catalog():Product[]{return PRODUCTS;}
export function bySlug(slug:string){return PRODUCTS.find(p=>p.slug===slug);}
