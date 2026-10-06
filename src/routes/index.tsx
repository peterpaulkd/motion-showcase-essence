import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Calendar, Github, Globe, Instagram, Lock, Mail, MapPin, Menu, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import cabinetImage from "@/assets/ppa-cabinet.jpg";
import districtImage from "@/assets/ppa-district.jpg";
import mapImage from "@/assets/ppa-survey-map.jpg";
//importing the new images for activities
import activity1 from "@/assets/activity1.jpeg";
import activity2 from "@/assets/activity2.jpeg";
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

type GalleryPhoto = { id: number; src: string; caption: string; tag: string };

type Event = {
  id: number;
  title: string;
  type: string;
  date: string;
  location: string;
  description: string;
  poster: string | null;
  coordinate: string;
  status: string;
};

const defaultEvents: Event[] = [
  { id: 1, coordinate: "01°17′S", title: "Kisumu field mapping drive", type: "Fieldwork", date: "18 Oct 2025", location: "Kisumu", description: "A hands-on field mapping exercise covering land parcels and public infrastructure in Kisumu's peri-urban zones.", poster: null, status: "Registration open" },
  { id: 2, coordinate: "00°06′S", title: "Urban futures symposium", type: "Symposium", date: "02 Nov 2025", location: "ISLM Auditorium", description: "A gathering of planners, students and practitioners to discuss the trajectory of urban development in East Africa.", poster: null, status: "Upcoming" },
  { id: 3, coordinate: "01°09′S", title: "Community land-use workshop", type: "Workshop", date: "16 Nov 2025", location: "Limuru", description: "Participatory workshop engaging local communities in land-use decision making and spatial planning processes.", poster: null, status: "Scheduled" },
];

const filters = ["All", "Fieldwork", "Symposium", "Workshop"];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

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
        <span className="float-badge absolute left-[8%] top-[50%] rounded-full border border-border bg-paper/80 px-2.5 py-1 text-[10px] font-semibold text-foreground/60 backdrop-blur-sm">01°17′S · 36°49′E</span>
      </div>
    </div>
  );
}

function Index() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const footerClickCount = useRef(0);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadTag, setUploadTag] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);

  const [addEventOpen, setAddEventOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", type: "Fieldwork", date: "", location: "", description: "", coordinate: "", status: "Upcoming", poster: null as string | null });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useReveal();

  const visibleEvents = events.filter((e) => filter === "All" || e.type === filter);

  function handleFooterClick() {
    footerClickCount.current += 1;
    if (footerClickCount.current >= 5) { footerClickCount.current = 0; setShowAdminPrompt(true); }
  }

  function handleAdminUnlock() {
    if (adminInput === "ppa2025") { setAdminUnlocked(true); setShowAdminPrompt(false); setAdminInput(""); }
    else setAdminInput("");
  }

  function handlePosterUpload(e: ChangeEvent<HTMLInputElement>, forEvent = false) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (forEvent) setNewEvent((prev) => ({ ...prev, poster: result }));
      else setUploadPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function handleAddEvent() {
    if (!newEvent.title || !newEvent.date) return;
    if (editEvent) {
      setEvents((prev) => prev.map((e) => e.id === editEvent.id ? { ...newEvent, id: editEvent.id } : e));
      setEditEvent(null);
    } else {
      setEvents((prev) => [...prev, { ...newEvent, id: Date.now() }]);
    }
    setNewEvent({ title: "", type: "Fieldwork", date: "", location: "", description: "", coordinate: "", status: "Upcoming", poster: null });
    setAddEventOpen(false);
  }

  function handleDeleteEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function openEditEvent(event: Event) {
    setEditEvent(event);
    setNewEvent({ title: event.title, type: event.type, date: event.date, location: event.location, description: event.description, coordinate: event.coordinate, status: event.status, poster: event.poster });
    setAddEventOpen(true);
  }

  function handleAddPhoto() {
    if (!uploadPreview) return;
    setGallery((prev) => [...prev, { id: Date.now(), src: uploadPreview, caption: uploadCaption || "Field record", tag: uploadTag || "fieldwork" }]);
    setUploadOpen(false); setUploadCaption(""); setUploadTag(""); setUploadPreview(null);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-body text-foreground">

      {/* Admin bar */}
      {adminUnlocked && (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-sage/30 bg-sage/10 px-5 py-2 text-xs font-semibold text-pine lg:px-8">
          <span className="flex items-center gap-2"><Lock size={11} className="text-sage" /> Admin mode active</span>
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditEvent(null); setNewEvent({ title: "", type: "Fieldwork", date: "", location: "", description: "", coordinate: "", status: "Upcoming", poster: null }); setAddEventOpen(true); }} className="flex items-center gap-1.5 rounded-md bg-pine px-3 py-1.5 text-paper hover:bg-pine/80 transition-colors"><Plus size={11} /> Add event</button>
            <button onClick={() => setUploadOpen(true)} className="flex items-center gap-1.5 rounded-md border border-pine/30 px-3 py-1.5 hover:bg-pine/5 transition-colors"><Upload size={11} /> Upload photo</button>
            <button onClick={() => setAdminUnlocked(false)} className="text-foreground/50 hover:text-foreground transition-colors">Exit</button>
          </div>
        </div>
      )}

      <header className={`sticky ${adminUnlocked ? "" : "top-0"} z-40 border-b border-border bg-background/90 backdrop-blur-xl`}>
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="PPA home">
            <span className="grid size-10 place-items-center rounded-sm bg-primary font-display text-sm font-extrabold text-primary-foreground">PP</span>
            <span className="leading-tight"><strong className="block font-display text-sm">Physical Planning Association</strong><span className="text-[10px] uppercase text-foreground/50">ISLM · Student Chapter</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
            {["about", "cabinet", "events", "gallery"].map((item) => (
              <a key={item} href={`#${item}`} className="relative py-1 capitalize after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-terracotta after:transition-all after:duration-300 hover:text-terracotta hover:after:w-full">{item}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 text-[10px] font-bold uppercase sm:flex"><span className="pulse-dot size-2 rounded-full bg-sage" />Chapter active</div>
          <Button variant="quiet" size="icon" className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</Button>
        </div>
        {mobileOpen && (
          <nav className="grid gap-1 border-t border-border px-5 py-4 md:hidden">
            {["about", "cabinet", "events", "gallery"].map((item) => (
              <a key={item} href={`#${item}`} onClick={() => setMobileOpen(false)} className="py-3 font-display text-xl font-semibold capitalize">{item}</a>
            ))}
          </nav>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 lg:grid-cols-12 lg:px-8 lg:py-18">
          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="anim-rise text-[11px] font-bold uppercase text-terracotta">Survey · Layer 01</p>
            <h1 className="anim-rise mt-5 max-w-[11ch] font-display text-5xl font-extrabold leading-[0.96] sm:text-6xl lg:text-7xl [animation-delay:80ms]">We Plan for the Future</h1>
            <p className="anim-rise mt-6 max-w-[45ch] text-base leading-7 text-foreground/70 [animation-delay:160ms]">A collective of planners turning spatial knowledge into organized, inclusive and sustainable places under the Institute of Survey and Land Management.</p>
            <div className="anim-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Button asChild><a href="#gallery">Explore Gallery <ArrowDownRight size={17} /></a></Button>
              <Button asChild variant="outline"><a href="#events">Upcoming Events <ArrowUpRight size={17} /></a></Button>
            </div>
            <dl className="anim-rise mt-10 grid grid-cols-3 border-t border-border pt-6 [animation-delay:320ms]">
              {[["128", "Members"], ["14", "Projects"], ["32", "Field days"]].map(([value, label]) => (
                <div key={label}><dd className="font-display text-2xl font-bold">{value}</dd><dt className="mt-1 text-[9px] uppercase text-foreground/45">{label}</dt></div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-7"><PlanningCanvas /></div>
        </section>

        {/* About */}
        <section id="about" className="border-y border-border bg-card/45">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-18 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7">
              <p className="reveal reveal-left stagger-1 text-[11px] font-bold uppercase text-terracotta">(a) About the association</p>
              <h2 className="reveal stagger-2 mt-4 max-w-[20ch] font-display text-4xl font-bold leading-tight">A coherent future, planned layer by layer.</h2>
              <p className="reveal stagger-3 mt-5 max-w-[60ch] leading-7 text-foreground/70">The Physical Planning Association (PPA) is the student chapter of the Institute of Survey and Land Management (ISLM). We are a community of emerging spatial planners, GIS analysts, and urban development practitioners committed to shaping resilient, inclusive, and sustainable communities across Uganda and East Africa.</p>
              <p className="reveal stagger-4 mt-4 max-w-[60ch] leading-7 text-foreground/70">Founded to bridge the gap between academic theory and real-world practice, PPA organises field mapping drives, symposia, workshops, and community engagement programmes. Our members gain hands-on experience in land-use planning, cadastral surveying, environmental impact assessment, and participatory community planning.</p>
              <p className="reveal stagger-5 mt-4 max-w-[60ch] leading-7 text-foreground/70">We collaborate with county governments, NGOs, and international planning bodies to deliver projects that matter — from informal settlement upgrading to green corridor design and urban mobility studies.</p>
            </div>
            <div className="reveal stagger-2 grid content-start gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:col-span-5">
              <div className="bg-paper p-6"><span className="text-[10px] uppercase text-foreground/45">Vision</span><p className="mt-2 font-display text-lg font-semibold">Liveable places for every community.</p></div>
              <div className="bg-paper p-6"><span className="text-[10px] uppercase text-foreground/45">Method</span><p className="mt-2 font-display text-lg font-semibold">Observe. Map. Convene. Act.</p></div>
              <div className="bg-paper p-6"><span className="text-[10px] uppercase text-foreground/45">Focus areas</span><p className="mt-2 font-display text-lg font-semibold">GIS · Land use · Urban design · Policy</p></div>
              <div className="bg-paper p-6"><span className="text-[10px] uppercase text-foreground/45">Established</span><p className="mt-2 font-display text-lg font-semibold">ISLM Student Chapter · 2019</p></div>
              <div className="bg-paper p-6 sm:col-span-2"><span className="text-[10px] uppercase text-foreground/45">Affiliation</span><p className="mt-2 font-display text-lg font-semibold">Institute of Survey and Land Management, Uganda Physical Planners Registration Board (KPPRB)</p></div>
            </div>
          </div>
        </section>

        {/* Cabinet */}
        <section id="cabinet" className="mx-auto grid max-w-7xl gap-6 px-5 py-18 lg:grid-cols-12 lg:px-8">
          <div className="reveal reveal-left stagger-1 overflow-hidden rounded-lg lg:col-span-5"><img src={cabinetImage} alt="Physical Planning Association student leaders" width={1024} height={768} loading="lazy" className="h-full min-h-80 w-full object-cover transition-transform duration-700 hover:scale-[1.02]" /></div>
          <div className="reveal stagger-2 flex flex-col justify-between rounded-lg border border-border bg-card p-7 lg:col-span-7">
            <div><p className="text-[11px] font-bold uppercase text-terracotta">(b) Governance cabinet</p><h2 className="mt-3 font-display text-3xl font-bold">The people steering the plan</h2></div>
            <div className="mt-8 divide-y divide-border">
              {[["Amina Noor", "President", "Urban policy & governance"], ["Daniel Mwangi", "Vice President", "GIS & spatial analytics"], ["Wanjiku Kamau", "General Secretary", "Community planning"]].map(([name, role, focus], index) => (
                <div key={name} className="grid grid-cols-[2rem_1fr] gap-3 py-4 sm:grid-cols-[2rem_1fr_1fr]">
                  <span className="text-xs text-foreground/40">0{index + 1}</span>
                  <div><p className="font-semibold">{name}</p><p className="text-xs text-terracotta">{role}</p></div>
                  <p className="hidden text-sm text-foreground/55 sm:block">{focus}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events */}
        <section id="events" className="border-y border-border bg-secondary/35">
          <div className="mx-auto max-w-7xl px-5 py-18 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="reveal stagger-1">
                <p className="text-[11px] font-bold uppercase text-terracotta">(c) Activity roadmap</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Upcoming on the table</h2>
              </div>
              <div className="reveal stagger-2 flex flex-wrap items-center gap-2">
                {filters.map((item) => (
                  <Button key={item} size="sm" variant={filter === item ? "primary" : "outline"} onClick={() => setFilter(item)}>{item}</Button>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event, i) => (
                <article key={event.id} className={`reveal stagger-${Math.min(i + 1, 5)} group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`} onClick={() => setSelectedEvent(event)}>
                  {event.poster ? (
                    <img src={event.poster} alt={event.title} className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-secondary/60 grid place-items-center relative overflow-hidden">
                      <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                      <span className="relative text-[10px] uppercase text-foreground/40 font-semibold tracking-widest">{event.type}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase text-terracotta">{event.type}</span>
                    <h3 className="mt-1 font-display text-lg font-bold leading-snug">{event.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/55">
                      <span className="flex items-center gap-1"><Calendar size={11} />{event.date}</span>
                      {event.location && <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/65">{event.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-block rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase">{event.status}</span>
                      {adminUnlocked && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditEvent(event)} className="rounded p-1.5 text-foreground/40 hover:bg-secondary hover:text-foreground transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => handleDeleteEvent(event.id)} className="rounded p-1.5 text-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="mx-auto max-w-7xl px-5 py-18 lg:px-8">
          <div className="mb-8 reveal stagger-1">
            <p className="text-[11px] font-bold uppercase text-terracotta">(d) Field archive</p>
            <h2 className="mt-3 font-display text-3xl font-bold">Places, people and plans</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-12">
            <figure className="reveal stagger-2 group relative overflow-hidden rounded-lg md:col-span-7">
              <img src={activity1} alt="Planned district with green public corridors" width={1024} height={768} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/>
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 bg-primary/85 p-5 text-primary-foreground backdrop-blur transition-transform duration-300 group-hover:translate-y-0"><span className="text-[10px] uppercase">Field Activity 01</span>
              <p className="mt-1 font-display text-lg font-semibold">Clean neighbourhood and keeping public natural green</p></figcaption>
            </figure>
            <figure className="reveal stagger-3 group relative overflow-hidden rounded-lg md:col-span-5">
              <img src={activity2} alt="Urban planning survey map on a work table" width={1024} height={768} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/>
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 bg-background/90 p-5 backdrop-blur transition-transform duration-300 group-hover:translate-y-0"><span className="text-[10px] uppercase text-foreground/50">National Cleaning Day</span>
              <p className="mt-1 font-display text-lg font-semibold">From contours to community</p></figcaption>
            </figure>
            {gallery.map((photo, i) => (
              <figure key={photo.id} className={`reveal stagger-${Math.min(i + 1, 5)} group relative overflow-hidden rounded-lg md:col-span-${i % 2 === 0 ? "5" : "7"}`}>
                <img src={photo.src} alt={photo.caption} className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"/>
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 bg-background/90 p-5 backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
                  <span className="text-[10px] uppercase text-foreground/50">{photo.tag}</span>
                  <p className="mt-1 font-display text-lg font-semibold">{photo.caption}</p>
                </figcaption>
                {adminUnlocked && (
                  <button onClick={() => setGallery((prev) => prev.filter((p) => p.id !== photo.id))} className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-foreground/60 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:text-destructive"><Trash2 size={13} /></button>
                )}
              </figure>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-sm bg-primary font-display text-sm font-extrabold text-primary-foreground">PP</span>
                <span className="leading-tight"><strong className="block font-display text-sm">Physical Planning Association</strong><span className="text-[10px] uppercase text-foreground/50">ISLM · Student Chapter</span></span>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/60">Shaping sustainable communities through planning, GIS, fieldwork, and public action.</p>
              <div className="mt-5 flex gap-3">
                <a href="#" aria-label="Instagram" className="grid size-8 place-items-center rounded-md border border-border text-foreground/50 transition-colors hover:border-terracotta hover:text-terracotta"><Instagram size={14} /></a>
                <a href="#" aria-label="Email" className="grid size-8 place-items-center rounded-md border border-border text-foreground/50 transition-colors hover:border-terracotta hover:text-terracotta"><Mail size={14} /></a>
                <a href="#" aria-label="Website" className="grid size-8 place-items-center rounded-md border border-border text-foreground/50 transition-colors hover:border-terracotta hover:text-terracotta"><Globe size={14} /></a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-[10px] font-bold uppercase text-foreground/40">Navigation</p>
              <ul className="mt-4 grid gap-2.5 text-sm text-foreground/65">
                {["About", "Cabinet", "Events", "Gallery"].map((item) => (
                  <li key={item}><a href={`#${item.toLowerCase()}`} className="hover:text-terracotta transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Association */}
            <div>
              <p className="text-[10px] font-bold uppercase text-foreground/40">Association</p>
              <ul className="mt-4 grid gap-2.5 text-sm text-foreground/65">
                <li><span>ISLM Student Chapter</span></li>
                <li><span>Est. 2019</span></li>
                <li><span>Entebbe, Uganda</span></li>
                <li><span>01°17′S · 36°49′E</span></li>
                <li><a href="mailto:ppa@islm.ac.ke" className="hover:text-terracotta transition-colors">ppa@islm.ac.ke</a></li>
              </ul>
            </div>

            {/* Developer */}
            <div>
              <p className="text-[10px] font-bold uppercase text-foreground/40">Developer</p>
              <div className="mt-4">
                <p className="font-display text-sm font-semibold">Built with precision</p>
                <p className="mt-1 text-sm text-foreground/60">Designed & developed for the Physical Planning Association, ISLM.</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-foreground/60">
                  <Github size={13} />
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">View source</a>
                </div>
                <p className="mt-3 text-[10px] text-foreground/40">Stack: React · TanStack Router · Tailwind CSS v4</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-foreground/40">
            <p className="cursor-default select-none" onClick={handleFooterClick}>© {new Date().getFullYear()} Physical Planning Association · ISLM. All rights reserved.</p>
            <p>Plan responsibly · Build inclusively · Map everything</p>
          </div>
        </div>
      </footer>

      {/* Admin unlock prompt */}
      {showAdminPrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Admin access</h2>
              <Button variant="quiet" size="icon" onClick={() => setShowAdminPrompt(false)}><X /></Button>
            </div>
            <p className="mb-4 text-sm text-foreground/55">Enter the admin password to unlock content management.</p>
            <input
              type="password"
              className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              placeholder="Enter admin password"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminUnlock()}
              autoFocus
            />
            <Button className="mt-4 w-full" onClick={handleAdminUnlock}>Unlock</Button>
          </div>
        </div>
      )}

      {/* Upload photo modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.currentTarget === e.target) setUploadOpen(false); }}>
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-bold uppercase text-terracotta">Media vault</p><h2 className="mt-2 font-display text-2xl font-bold">Add a field record</h2></div>
              <Button variant="quiet" size="icon" onClick={() => setUploadOpen(false)}><X /></Button>
            </div>
            <label className="mt-6 grid min-h-44 cursor-pointer place-items-center rounded-md border border-dashed border-primary/35 bg-secondary/35 p-8 text-center overflow-hidden">
              {uploadPreview ? (
                <img src={uploadPreview} alt="Preview" className="max-h-40 rounded object-contain" />
              ) : (
                <span><Plus className="mx-auto mb-3"/><strong className="block text-sm">Choose a photo or drop it here</strong><span className="mt-1 block text-xs text-foreground/50">JPG or PNG · maximum 8 MB</span></span>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handlePosterUpload(e, false)}/>
            </label>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Caption" value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)}/>
              <input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Tag, e.g. fieldwork" value={uploadTag} onChange={(e) => setUploadTag(e.target.value)}/>
            </div>
            <Button className="mt-5 w-full" onClick={handleAddPhoto} disabled={!uploadPreview}>Add to gallery <ArrowUpRight size={16}/></Button>
          </div>
        </div>
      )}

      {/* Add / Edit event modal */}
      {addEventOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.currentTarget === e.target) { setAddEventOpen(false); setEditEvent(null); } }}>
          <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div><p className="text-[10px] font-bold uppercase text-terracotta">Admin · Events</p><h2 className="mt-1 font-display text-2xl font-bold">{editEvent ? "Edit event" : "Add new event"}</h2></div>
              <Button variant="quiet" size="icon" onClick={() => { setAddEventOpen(false); setEditEvent(null); }}><X /></Button>
            </div>
            <div className="grid gap-3">
              <input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Event title *" value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}/>
              <div className="grid grid-cols-2 gap-3">
                <select className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" value={newEvent.type} onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value }))}>
                  {filters.filter((f) => f !== "All").map((f) => <option key={f}>{f}</option>)}
                </select>
                <select className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" value={newEvent.status} onChange={(e) => setNewEvent((p) => ({ ...p, status: e.target.value }))}>
                  {["Upcoming", "Registration open", "Scheduled", "Completed"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" value={newEvent.date} onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}/>
                <input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent((p) => ({ ...p, location: e.target.value }))}/>
              </div>
              <input className="h-11 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Coordinate e.g. 01°17′S" value={newEvent.coordinate} onChange={(e) => setNewEvent((p) => ({ ...p, coordinate: e.target.value }))}/>
              <textarea className="min-h-20 rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" placeholder="Event description" value={newEvent.description} onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}/>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-primary/35 bg-secondary/35 px-4 py-3 text-sm">
                <Upload size={15} className="shrink-0 text-foreground/50"/>
                <span className="text-foreground/60">{newEvent.poster ? "Poster selected ✓" : "Upload event poster (optional)"}</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handlePosterUpload(e, true)}/>
              </label>
            </div>
            <Button className="mt-5 w-full" onClick={handleAddEvent}>{editEvent ? "Save changes" : "Add event"} <ArrowUpRight size={16}/></Button>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.currentTarget === e.target) setSelectedEvent(null); }}>
          <div className="w-full max-w-lg rounded-lg border border-border bg-background shadow-2xl overflow-hidden">
            {selectedEvent.poster ? (
              <img src={selectedEvent.poster} alt={selectedEvent.title} className="aspect-[16/9] w-full object-cover"/>
            ) : (
              <div className="aspect-[16/9] w-full bg-secondary/60 grid place-items-center relative overflow-hidden">
                <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                <span className="relative text-[10px] uppercase text-foreground/30 font-semibold tracking-widest">{selectedEvent.type}</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-terracotta">{selectedEvent.type}</span>
                  <h2 className="mt-1 font-display text-2xl font-bold">{selectedEvent.title}</h2>
                </div>
                <Button variant="quiet" size="icon" onClick={() => setSelectedEvent(null)}><X /></Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/60">
                <span className="flex items-center gap-1.5"><Calendar size={13} />{selectedEvent.date}</span>
                {selectedEvent.location && <span className="flex items-center gap-1.5"><MapPin size={13} />{selectedEvent.location}</span>}
                {selectedEvent.coordinate && <span className="flex items-center gap-1.5 text-[11px] font-mono">{selectedEvent.coordinate}</span>}
              </div>
              {selectedEvent.description && <p className="mt-4 leading-7 text-foreground/70">{selectedEvent.description}</p>}
              <span className="mt-5 inline-block rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase">{selectedEvent.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
