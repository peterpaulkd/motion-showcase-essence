import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Menu, Plus, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";

import cabinetImage from "@/assets/ppa-cabinet.jpg";
import districtImage from "@/assets/ppa-district.jpg";
import mapImage from "@/assets/ppa-survey-map.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Physical Planning Association | ISLM" },
      { name: "description", content: "The Physical Planning Association shapes sustainable communities through planning, GIS, fieldwork, and public action." },
      { property: "og:title", content: "Physical Planning Association | ISLM" },
      { property: "og:description", content: "We plan for the future—parcel by parcel, community by community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const activities = [
  { coordinate: "01°17′S", title: "Kisumu field mapping drive", type: "Fieldwork", meta: "18 Oct · 24 contributors", status: "Registration open" },
  { coordinate: "00°06′S", title: "Urban futures symposium", type: "Symposium", meta: "02 Nov · ISLM auditorium", status: "Upcoming" },
  { coordinate: "01°09′S", title: "Community land-use workshop", type: "Workshop", meta: "16 Nov · Limuru", status: "Scheduled" },
];

const filters = ["All", "Fieldwork", "Symposium", "Workshop"];

function PlanningCanvas() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-border bg-secondary/45 p-5 lg:min-h-[540px]">
      <div className="relative z-20 flex items-center justify-between text-[10px] font-semibold uppercase text-foreground/55">
        <span>Master plan · unfolding</span><span>Scale 1:2000</span>
      </div>
      <div className="absolute inset-x-5 bottom-5 top-14 overflow-hidden rounded-md border border-border bg-paper">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 500" fill="none" aria-hidden="true">
          <path className="map-route" d="M-20 410C92 342 121 371 187 299C253 227 267 151 377 181C487 211 483 86 581 117C643 137 676 103 746 43" stroke="var(--terracotta)" strokeWidth="12" strokeLinecap="round" />
          <path className="map-route" d="M13 116C130 107 143 168 229 157C315 146 331 68 435 96C539 124 559 236 731 212" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round" />
          <path className="map-route" d="M58 476C139 392 235 435 302 354C369 273 421 333 488 287C555 241 604 304 745 250" stroke="var(--pine)" strokeOpacity=".55" strokeWidth="2" strokeDasharray="8 9" />
          <g stroke="var(--pine)" strokeOpacity=".24">
            <path d="M92 72h150v116H92z"/><path d="M472 304h142v108H472z"/><path d="M288 212h119v96H288z"/>
          </g>
        </svg>
        <div className="plot-in absolute left-[13%] top-[17%] h-20 w-28 rounded-sm bg-terracotta/40" />
        <div className="plot-in absolute right-[15%] top-[27%] h-24 w-20 rounded-sm bg-pine/20 [animation-delay:400ms]" />
        <div className="plot-in absolute bottom-[13%] left-[38%] size-24 rounded-full border-2 border-dashed border-terracotta/70 [animation-delay:700ms]" />
        <div className="scan-line absolute bottom-0 top-0 w-px bg-terracotta/80 shadow-[0_0_18px_var(--terracotta)]" />
        <span className="absolute left-[11%] top-[10%] text-[9px] font-semibold uppercase text-foreground/50">Civic core</span>
        <span className="absolute bottom-[10%] right-[10%] text-[9px] font-semibold uppercase text-foreground/50">Green corridor</span>
        <span className="absolute left-[8%] top-[50%] text-[10px] text-foreground/45">01°17′S · 36°49′E</span>
      </div>
    </div>
  );
}

function Index() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const visibleActivities = useMemo(() => activities.filter((item) => filter === "All" || item.type === filter), [filter]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="PPA home">
            <span className="grid size-10 place-items-center rounded-sm bg-primary font-display text-sm font-extrabold text-primary-foreground">PP</span>
            <span className="leading-tight"><strong className="block font-display text-sm">Physical Planning Association</strong><span className="text-[10px] uppercase text-foreground/50">ISLM · Student Chapter</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
            <a href="#mission" className="hover:text-terracotta">Mission</a><a href="#cabinet" className="hover:text-terracotta">Cabinet</a><a href="#roadmap" className="hover:text-terracotta">Roadmap</a><a href="#gallery" className="hover:text-terracotta">Gallery</a>
          </nav>
          <div className="hidden items-center gap-2 text-[10px] font-bold uppercase sm:flex"><span className="size-2 rounded-full bg-sage ring-4 ring-sage/15" />Chapter active</div>
          <Button variant="quiet" size="icon" className="md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</Button>
        </div>
        {mobileOpen && <nav className="grid gap-1 border-t border-border px-5 py-4 md:hidden">{["mission", "cabinet", "roadmap", "gallery"].map((item) => <a key={item} href={`#${item}`} onClick={() => setMobileOpen(false)} className="py-3 font-display text-xl font-semibold capitalize">{item}</a>)}</nav>}
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 lg:grid-cols-12 lg:px-8 lg:py-18">
          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="anim-rise text-[11px] font-bold uppercase text-terracotta">Survey · Layer 01</p>
            <h1 className="anim-rise mt-5 max-w-[11ch] font-display text-5xl font-extrabold leading-[0.96] sm:text-6xl lg:text-7xl [animation-delay:80ms]">We Plan for the Future</h1>
            <p className="anim-rise mt-6 max-w-[45ch] text-base leading-7 text-foreground/70 [animation-delay:160ms]">A collective of planners turning spatial knowledge into organized, inclusive and sustainable places under the Institute of Survey and Land Management.</p>
            <div className="anim-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Button asChild><a href="#gallery">Explore Gallery <ArrowDownRight size={17} /></a></Button>
              <Button asChild variant="outline"><a href="#roadmap">Upcoming Roadmap <ArrowUpRight size={17} /></a></Button>
            </div>
            <dl className="anim-rise mt-10 grid grid-cols-3 border-t border-border pt-6 [animation-delay:320ms]">
              {[['128','Members'],['14','Projects'],['32','Field days']].map(([value,label]) => <div key={label}><dd className="font-display text-2xl font-bold">{value}</dd><dt className="mt-1 text-[9px] uppercase text-foreground/45">{label}</dt></div>)}
            </dl>
          </div>
          <div className="lg:col-span-7"><PlanningCanvas /></div>
        </section>

        <section id="mission" className="border-y border-border bg-card/45">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-18 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7"><p className="text-[11px] font-bold uppercase text-terracotta">(a) Mission & vision</p><h2 className="mt-4 max-w-[18ch] font-display text-4xl font-bold leading-tight">A coherent future, planned layer by layer.</h2><p className="mt-5 max-w-[58ch] leading-7 text-foreground/70">We connect physical planning, GIS modelling, land use and urban development. Our work gives emerging professionals the field experience, public purpose and collaborative platform to shape resilient communities.</p></div>
            <div className="grid content-end gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:col-span-5"><div className="bg-paper p-6"><span className="text-[10px] uppercase text-foreground/45">Vision</span><p className="mt-2 font-display text-lg font-semibold">Liveable places for every community.</p></div><div className="bg-paper p-6"><span className="text-[10px] uppercase text-foreground/45">Method</span><p className="mt-2 font-display text-lg font-semibold">Observe. Map. Convene. Act.</p></div></div>
          </div>
        </section>

        <section id="cabinet" className="mx-auto grid max-w-7xl gap-6 px-5 py-18 lg:grid-cols-12 lg:px-8">
          <div className="overflow-hidden rounded-lg lg:col-span-5"><img src={cabinetImage} alt="Physical Planning Association student leaders" width={1024} height={768} loading="lazy" className="h-full min-h-80 w-full object-cover" /></div>
          <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-7 lg:col-span-7">
            <div><p className="text-[11px] font-bold uppercase text-terracotta">(b) Governance cabinet</p><h2 className="mt-3 font-display text-3xl font-bold">The people steering the plan</h2></div>
            <div className="mt-8 divide-y divide-border">{[['Amina Noor','President','Urban policy & governance'],['Daniel Mwangi','Vice President','GIS & spatial analytics'],['Wanjiku Kamau','General Secretary','Community planning']].map(([name,role,focus],index) => <div key={name} className="grid grid-cols-[2rem_1fr] gap-3 py-4 sm:grid-cols-[2rem_1fr_1fr]"><span className="text-xs text-foreground/40">0{index+1}</span><div><p className="font-semibold">{name}</p><p className="text-xs text-terracotta">{role}</p></div><p className="hidden text-sm text-foreground/55 sm:block">{focus}</p></div>)}</div>
          </div>
        </section>

        <section id="gallery" className="border-y border-border bg-secondary/35">
          <div className="mx-auto max-w-7xl px-5 py-18 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase text-terracotta">(c) Field archive</p><h2 className="mt-3 font-display text-3xl font-bold">Places, people and plans</h2></div><Button variant="outline" onClick={() => setUploadOpen(true)}><Upload size={16}/> Upload photo</Button></div>
            <div className="grid gap-5 md:grid-cols-12"><figure className="group relative overflow-hidden rounded-lg md:col-span-7"><img src={districtImage} alt="Planned district with green public corridors" width={1024} height={768} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/><figcaption className="absolute inset-x-0 bottom-0 bg-primary/85 p-5 text-primary-foreground backdrop-blur"><span className="text-[10px] uppercase">Field study 04</span><p className="mt-1 font-display text-lg font-semibold">Growth corridors and public green</p></figcaption></figure><figure className="group relative overflow-hidden rounded-lg md:col-span-5"><img src={mapImage} alt="Urban planning survey map on a work table" width={1024} height={768} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/><figcaption className="absolute inset-x-0 bottom-0 bg-background/90 p-5 backdrop-blur"><span className="text-[10px] uppercase text-foreground/50">Studio log 12</span><p className="mt-1 font-display text-lg font-semibold">From contours to community</p></figcaption></figure></div>
          </div>
        </section>

        <section id="roadmap" className="mx-auto max-w-7xl px-5 py-18 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-[11px] font-bold uppercase text-terracotta">(d) Activity roadmap</p><h2 className="mt-3 font-display text-3xl font-bold">Upcoming on the table</h2></div><div className="flex flex-wrap gap-2" aria-label="Filter activities">{filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "primary" : "outline"} onClick={() => setFilter(item)}>{item}</Button>)}</div></div>
          <div className="mt-8 min-h-60 border-t border-border">{visibleActivities.map((item) => <article key={item.title} className="grid gap-3 border-b border-border py-6 sm:grid-cols-[7rem_1fr_auto] sm:items-center"><span className="text-[10px] uppercase text-foreground/40">{item.coordinate}</span><div><p className="font-display text-lg font-semibold">{item.title}</p><p className="mt-1 text-xs text-foreground/50">{item.type} · {item.meta}</p></div><span className="w-fit rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase">{item.status}</span></article>)}</div>
        </section>
      </main>

      <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-foreground/50 lg:px-8"><p>© 2026 Physical Planning Association · ISLM</p><p>01°17′S · 36°49′E · Plan responsibly</p></div></footer>

      {uploadOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Upload gallery photo" onMouseDown={(event) => { if (event.currentTarget === event.target) setUploadOpen(false); }}><div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase text-terracotta">Media vault</p><h2 className="mt-2 font-display text-2xl font-bold">Add a field record</h2></div><Button variant="quiet" size="icon" onClick={() => setUploadOpen(false)} aria-label="Close upload dialog"><X /></Button></div><label className="mt-6 grid min-h-44 cursor-pointer place-items-center rounded-md border border-dashed border-primary/35 bg-secondary/35 p-8 text-center"><input type="file" accept="image/*" className="sr-only"/><span><Plus className="mx-auto mb-3"/><strong className="block text-sm">Choose a photo or drop it here</strong><span className="mt-1 block text-xs text-foreground/50">JPG or PNG · maximum 8 MB</span></span></label><div className="mt-5 grid gap-3 sm:grid-cols-2"><input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Caption"/><input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Tag, e.g. fieldwork"/></div><Button className="mt-5 w-full" onClick={() => setUploadOpen(false)}>Add to gallery <ArrowUpRight size={16}/></Button></div></div>}
    </div>
  );
}
