import {notFound} from 'next/navigation';
import {isLocale} from '@buildnest/contracts';
import {NativeStorefront} from '@/components/native/storefront';
export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){
 const {locale,slug}=await params;if(!isLocale(locale))notFound();
 return <NativeStorefront locale={locale} initialView="marketplace" initialProductId={slug}/>;
}
