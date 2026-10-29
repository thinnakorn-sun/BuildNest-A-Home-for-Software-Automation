import {notFound} from 'next/navigation';import {AccountClient} from '@/components/account-client';
export default async function AccountPage({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(locale!=='en'&&locale!=='th')notFound();return <AccountClient locale={locale}/>}
