import {notFound} from 'next/navigation';
import {isLocale} from '@buildnest/contracts';
import {NativeStorefront} from '@/components/native/storefront';
/** Native React route; the original M1.1 standalone HTML remains separately available for screenshot fallback. */
export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();
 return <NativeStorefront locale={locale} initialView="orders"/>;
}
