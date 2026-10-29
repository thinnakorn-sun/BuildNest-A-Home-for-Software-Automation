'use client';
import {useState,useEffect} from 'react';
import type {ReactNode} from 'react';
const nav=[{group:'DISCOVER',items:[['Overview','overview','⌂'],['Marketplace','marketplace','▦'],['Automations','automations','↗'],['Free tools','free-tools','⚒'],['Guides & docs','guides','▤']]},{group:'WORKSPACE',items:[['My library','library','▣'],['Order history','orders','◷']]},{group:'MANAGEMENT',items:[['Admin dashboard','admin','◫']]}];
export function LockedShell({children,locale,heading}:{children:ReactNode;locale:'en'|'th';heading:string}){
 const[open,setOpen]=useState(false),[dark,setDark]=useState(false);
 useEffect(()=>{const value=window.localStorage.getItem('buildnest:dark-mode')==='true';setDark(value);document.body.classList.toggle('dark',value);return()=>document.body.classList.remove('dark')},[]);
 function flip(){const value=!dark;setDark(value);document.body.classList.toggle('dark',value);localStorage.setItem('buildnest:dark-mode',String(value))}
 const preview=`/buildnest/index.html?lang=${locale}`;
 return <div className="shell">
 <aside className={'sidebar'+(open?' open':'')} id="sidebar">
   <div className="brand"><div className="brand-mark"><span>◈</span></div><div className="brand-text"><b>buildnest<span className="brand-dot">.</span></b><small>SOFTWARE STUDIO</small></div><button className="side-close" aria-label="Close sidebar" onClick={()=>setOpen(false)}>×</button></div>
   <div className="workspace-pill"><span className="workspace-avatar">B</span><span className="workspace-copy"><b>Personal workspace</b><small>Software business / demo</small></span><span className="chev">⌄</span></div>
   {nav.map(g=><div key={g.group}><div className="nav-label">{g.group}</div><nav aria-label={g.group}>{g.items.map(([label,id,ico])=><a key={id} className="nav-item" href={`${preview}&view=${id}`}><span className="nav-ico">{ico}</span><span>{label}</span>{id==='marketplace'&&<span className="nav-count">8</span>}</a>)}</nav></div>)}
   <div className="side-spacer"/>
   <div className="plan-card"><div className="plan-top"><span className="tiny-star">✦</span> BUILDNEST LAB</div><b>Build once. Sell worldwide.</b><p>Automation, AI, and desktop tools in one place.</p><a href={`${preview}&view=guides`}>View roadmap ↗</a></div>
   <div className="sidebar-footer"><div className="small-avatar">BN</div><div><b>BuildNest Studio</b><small>Developer workspace</small></div><span className="ellipsis">•••</span></div>
 </aside>
 <div className={'overlay'+(open?' open':'')} onClick={()=>setOpen(false)} aria-hidden="true"/>
 <main className="main"><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open menu">☰</button><div className="breadcrumbs"><span>WORKSPACE</span><span>/</span><b>{heading}</b></div><div className="top-actions"><div className="top-search"><span>⌕</span><input type="search" readOnly aria-label="Search in catalog" placeholder="Search tools, apps" onClick={()=>window.location.assign(`${preview}&view=marketplace`)}/><kbd>⌘ K</kbd></div><button className="icon-btn" title="Theme" aria-label="Toggle theme" onClick={flip}>{dark?'☀':'☾'}</button><a className="lang-switch" href={`/${locale==='en'?'th':'en'}${heading==='Account'?'/account':'/manage/products'}`}>{locale.toUpperCase()} ⌄</a><span className="top-avatar">BN</span></div></header>
 <div className="content">{children}</div></main></div>;
}
