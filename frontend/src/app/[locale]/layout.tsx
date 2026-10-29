import {notFound} from 'next/navigation';
import {isLocale} from '@buildnest/contracts';
export async function generateStaticParams(){return [{locale:'en'},{locale:'th'}]}
export default async function LocalizedLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const{locale}=await params;if(!isLocale(locale))notFound();return <>{children}</>}
