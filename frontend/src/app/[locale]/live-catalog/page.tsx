import {notFound} from 'next/navigation';import {LiveCatalog} from '@/components/live-catalog';
export default async function Page({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(locale!=='en'&&locale!=='th')notFound();return <LiveCatalog locale={locale}/>}
