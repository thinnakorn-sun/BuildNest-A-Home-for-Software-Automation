import {notFound} from 'next/navigation';import {CmsClient} from '@/components/cms-client';
export default async function ManagePage({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(locale!=='en'&&locale!=='th')notFound();return <CmsClient locale={locale}/>}
