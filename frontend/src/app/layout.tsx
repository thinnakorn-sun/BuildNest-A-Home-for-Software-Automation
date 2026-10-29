import type {Metadata} from 'next';
import './canonical.css';
import './m2-supplement.css';
export const metadata:Metadata={title:{default:'BuildNest | Software Studio',template:'%s | BuildNest'},description:'Automation, AI, desktop and industrial software. M1 development preview — no live sales.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
