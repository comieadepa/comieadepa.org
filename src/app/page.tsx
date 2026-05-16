"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Facebook,
  Instagram,
  Landmark,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const ministerPortalUrl = "https://www.siscomieadepa.org/login";
const eventsPortalUrl = "https://eventos.siscomieadepa.org/eventos-publicos";

const navItems = ["A COMIEADEPA", "Presidência", "Eventos", "Notícias", "Departamentos", "Contato"];

const stats = [
  { value: "1921", label: "Fundada em" },
  { value: "100+", label: "Anos de história" },
  { value: "20 mil+", label: "Templos no Pará" },
  { value: "1ª", label: "Convenção assembleiana do Brasil" },
];

const events = [
  {
    title: "125ª Assembleia Geral Ordinária",
    date: "Agenda 2025",
    description: "A maior reunião deliberativa da COMIEADEPA, reunindo ministros e campos eclesiásticos de todo o Pará para governo, unidade e avanço da obra missionária.",
  },
  {
    title: "Congresso de Ministros",
    date: "Programação oficial",
    description: "Encontro ministerial de formação espiritual, comunhão fraterna e alinhamento institucional entre os obreiros credenciados da convenção.",
  },
  {
    title: "Congresso da Juventude — UMADESPA",
    date: "Calendário anual",
    description: "Mobilização da juventude assembleiana paraense para o evangelismo, o serviço e o compromisso inabalável com a obra missionária no Pará e além.",
  },
];

const departments = [
  {
    logo: "/assets/departamento-seiadepa.png",
    title: "SEIADEPA",
    text: "Departamento infantil, ensino bíblico e formação cristã para crianças.",
    accent: "#2aa8e8",
  },
  {
    logo: "/assets/departamento-conec.png",
    title: "CONEC",
    text: "Conselho de Educação Cristã, ensino, currículo e fortalecimento bíblico.",
    accent: "#c89a2d",
  },
  {
    logo: "/assets/departamento-aemadepa.png",
    title: "AEMADEPA",
    text: "Atuação ministerial, evangelização e apoio à missão da convenção.",
    accent: "#b46b2b",
  },
  {
    logo: "/assets/departamento-qgu.png",
    title: "QGU",
    text: "Quartel General UMADEPA, juventude, serviço e mobilização cristã.",
    accent: "#425f32",
  },
];

const videos = [
  { id: "SfBqj_dhhgw", title: "Cobertura oficial", label: "Shorts" },
  { id: "YJ6-AG7c0ww", title: "Momentos da convenção", label: "Shorts" },
  { id: "Mg07zDoUVhs", title: "Registro institucional", label: "Shorts" },
  { id: "Ko3czCnuasY", title: "Destaque da AGO", label: "Shorts" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 900], [0, 150]);
  const heroCopyY = useTransform(scrollY, [0, 900], [0, 42]);
  const heroVisualY = useTransform(scrollY, [0, 900], [0, -72]);
  const sedeParallaxY = useTransform(scrollY, [260, 1450], [-70, 92]);
  const newsParallaxY = useTransform(scrollY, [1500, 2600], [-90, 70]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#120f0a] text-[#fff7e5]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#120f0a]/64 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#" className="group flex items-center gap-3">
            <span className="relative grid h-12 w-12 place-items-center overflow-visible">
              <Image src="/assets/logo-comieadepa.png" alt="Brasão COMIEADEPA" width={48} height={48} className="object-contain drop-shadow-[0_0_18px_rgba(244,207,106,.28)]" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-2xl font-bold text-white">COMIEADEPA</span>
              <span className="block text-xs uppercase tracking-[0.24em] text-[#f4cf6a]">Desde 1921</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/74 lg:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${slugify(item)}`} className="relative py-2 transition hover:text-[#f4cf6a]">
                {item}
              </a>
            ))}
          </nav>

          <a
            href={ministerPortalUrl}
            className="hidden bg-[#f4cf6a] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#171006] shadow-[0_16px_40px_rgba(244,207,106,.22)] transition hover:-translate-y-0.5 hover:bg-white lg:inline-flex"
          >
            Área do Ministro
          </a>

          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center border border-white/15 bg-white/5 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#120f0a]/96 px-5 py-5 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-white/80">
              {navItems.map((item) => (
                <a key={item} href={`#${slugify(item)}`} onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <a href={ministerPortalUrl} className="mt-2 bg-[#f4cf6a] px-4 py-3 text-center font-black uppercase text-[#171006]">
                Área do Ministro
              </a>
            </nav>
          </div>
        )}
      </header>

      <section className="relative min-h-screen overflow-hidden pt-20">
        <motion.div style={{ y: heroImageY }} className="absolute -inset-x-8 -inset-y-16">
          <Image src="/assets/congresso-comieadepa.jpg" alt="Congresso COMIEADEPA com grande público" fill priority className="object-cover object-center" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,15,10,.96)_0%,rgba(18,15,10,.77)_42%,rgba(18,15,10,.16)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_56%_24%,rgba(244,207,106,.18),transparent_31%),radial-gradient(circle_at_88%_62%,rgba(139,47,43,.26),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-[linear-gradient(0deg,#120f0a_0%,rgba(18,15,10,.72)_42%,rgba(18,15,10,0)_100%)]" />
        <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />
        <motion.div style={{ y: heroVisualY }} className="absolute -right-24 top-14 hidden h-[92vh] w-[44vw] skew-x-[-16deg] bg-[#f4cf6a]/12 backdrop-blur-[1px] lg:block" />
        <motion.div style={{ y: heroCopyY }} className="absolute right-[18vw] top-0 hidden h-[62vh] w-24 skew-x-[-16deg] bg-[#8b2f2b]/38 lg:block" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.72fr)] xl:grid-cols-[minmax(0,0.98fr)_minmax(420px,0.76fr)]">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ y: heroCopyY }} className="relative z-20 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 border border-[#f4cf6a]/45 bg-black/22 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#f4cf6a] shadow-[0_16px_40px_rgba(0,0,0,.18)] backdrop-blur-md">
              <Sparkles size={16} />
              Berço do pentecostes no Brasil
            </div>
            <h1 className="font-serif text-[clamp(4.3rem,8vw,7.4rem)] font-black leading-[0.86] text-white drop-shadow-[0_14px_38px_rgba(0,0,0,.45)]">
              COMIEADEPA
            </h1>
            <p className="mt-6 max-w-3xl text-2xl font-semibold leading-tight text-[#f4cf6a] sm:text-4xl">
              A primeira convenção assembleiana do Brasil, fundada em 18 de agosto de 1921, no estado do Pará.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
              Mais de cem anos proclamando o Evangelho, reunindo ministros, igrejas e congregações em todo o Pará. Uma convenção edificada sobre fé, missão e fidelidade inabalável à Palavra de Deus.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#a-comieadepa" className="group inline-flex items-center justify-center gap-3 bg-[#f4cf6a] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#171006] transition hover:-translate-y-1 hover:bg-white">
                Conheça a história
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </a>
              <a href={eventsPortalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center border border-white/24 bg-white/8 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur transition hover:-translate-y-1 hover:border-[#f4cf6a] hover:text-[#f4cf6a]">
                Eventos oficiais
              </a>
            </div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-7 flex max-w-xl items-center gap-4 border border-[#f4cf6a]/22 bg-[#120f0a]/42 p-4 shadow-[0_18px_44px_rgba(0,0,0,.22)] backdrop-blur-xl"
            >
              <Image src="/assets/selo-125-ago.png" alt="Selo da 125ª AGO" width={82} height={82} className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(244,207,106,.28)]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f4cf6a]">Próxima AGO</p>
                <p className="mt-1 font-serif text-2xl font-black leading-tight text-white">125ª Assembleia Geral Ordinária</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.85 }} style={{ y: heroVisualY }} className="relative z-10 hidden min-h-[640px] lg:block">
            <motion.div
              animate={{ x: [0, 16, 0], opacity: [0.26, 0.42, 0.26] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 top-4 h-[600px] w-24 skew-x-[-16deg] bg-[#f4cf6a]/22"
            />
            <motion.div
              animate={{ x: [0, -12, 0], opacity: [0.18, 0.32, 0.18] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-32 top-24 h-[470px] w-16 skew-x-[-16deg] bg-[#8b2f2b]/32"
            />
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [-1.5, 1, -1.5] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-10 top-0 grid h-[360px] w-[360px] place-items-center"
            >
              <Image
                src="/assets/selo-125-ago.png"
                alt="Selo da 125ª AGO"
                width={360}
                height={360}
                className="relative h-[330px] w-[330px] object-contain drop-shadow-[0_28px_44px_rgba(0,0,0,.38)]"
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-16 right-0 w-[430px]"
            >
              <Image src="/img/presidente.png" alt="Pr. Océlio Nauar e esposa" width={860} height={700} className="h-auto w-full drop-shadow-[0_38px_46px_rgba(0,0,0,.58)]" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[#120f0a] px-5 sm:px-8" aria-label="Números institucionais">
        <div className="mx-auto -mt-16 grid max-w-7xl border border-[#f4cf6a]/18 bg-[#1b140b]/62 shadow-[0_28px_70px_rgba(0,0,0,.30)] backdrop-blur-xl md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="relative overflow-hidden border-b border-[#f4cf6a]/12 p-7 md:border-b-0 md:border-r">
              <p className="font-serif text-5xl font-black text-[#f4cf6a]">{stat.value}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-white/58">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="a-comieadepa" className="relative bg-[#120f0a] px-5 py-28 sm:px-8">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,#f4cf6a_1px,transparent_1px)] [background-size:42px_42px]" />
        <motion.div style={{ y: sedeParallaxY }} className="absolute -right-24 top-10 hidden h-[520px] w-[520px] border border-[#f4cf6a]/12 bg-[#f4cf6a]/5 backdrop-blur-sm lg:block [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="relative min-h-[540px]">
            <motion.div style={{ y: sedeParallaxY }} className="absolute left-0 top-0 h-[76%] w-[82%] overflow-hidden border border-white/12 bg-white/5 shadow-[0_38px_90px_rgba(0,0,0,.32)] backdrop-blur-sm [clip-path:polygon(0_0,100%_0,88%_100%,0_92%)]">
              <Image src="/assets/sede-comieadepa.png" alt="Sede institucional da COMIEADEPA" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-[#f4cf6a]/10" />
            </motion.div>
            <div className="absolute bottom-0 right-0 w-[56%] border border-[#f4cf6a]/28 bg-[#f6d87b]/86 p-8 text-[#171006] shadow-2xl backdrop-blur">
              <Landmark size={30} />
              <p className="mt-6 font-serif text-4xl font-black leading-none">18.08.1921</p>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em]">Fundada para servir a obra pentecostal</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">A COMIEADEPA</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-[1.02] text-white sm:text-5xl">
              A primeira convenção assembleiana do Brasil.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
              Fundada em 18 de agosto de 1921, a COMIEADEPA é reconhecida como a primeira convenção das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo clássico floresceu, a convenção reúne milhares de ministros, igrejas e congregações em centenas de campos eclesiásticos por todo o Pará — reconhecida como Patrimônio Cultural Material e Imaterial do Estado.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {["Evangelismo", "Missões", "Ação Social"].map((item) => (
                <div key={item} className="border border-white/10 bg-white/[0.055] p-5 backdrop-blur transition hover:bg-white/[0.085]">
                  <ShieldCheck className="text-[#f4cf6a]" size={22} />
                  <p className="mt-5 font-serif text-2xl font-bold text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="presidencia" className="relative overflow-hidden bg-[#f7efd6] px-5 py-24 text-[#171006] sm:px-8">
        <div className="absolute -left-20 top-0 h-full w-56 skew-x-[-16deg] bg-[#8b2f2b]/14" />
        <div className="absolute right-0 top-0 h-full w-1/3 skew-x-[-16deg] bg-[#f4cf6a]/36" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,rgba(139,47,43,.25)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8b2f2b]">Palavra do presidente</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] sm:text-5xl">Firmes no propósito, unidos na fé, avançando na missão.</h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4b3b23]">
              "A COMIEADEPA avança com a certeza de que Deus está no controle da Sua obra. Convoco cada ministro e cada congregação à unidade fraternal, à oração constante e ao compromisso inabalável com o Evangelho de nosso Senhor Jesus Cristo. Sigamos juntos, firmes na fé e ardentes no espírito." — Pr. Océlio Nauar, Presidente da COMIEADEPA
            </p>
            <a href="#" className="mt-9 inline-flex items-center gap-3 bg-[#171006] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] !text-[#f4cf6a] transition hover:-translate-y-1">
              Ler mensagem
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="relative min-h-[520px]">
            <div className="absolute bottom-0 left-1/2 h-[390px] w-[74%] -translate-x-1/2 bg-[#171006]/92 backdrop-blur [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]" />
            <Image src="/img/presidente.png" alt="Pr. Océlio Nauar e esposa" fill className="object-contain object-bottom drop-shadow-[0_30px_42px_rgba(0,0,0,.35)]" />
          </div>
        </div>
      </section>

      <section id="eventos" className="relative overflow-hidden bg-[#120f0a] px-5 py-28 sm:px-8">
        <motion.div style={{ y: newsParallaxY }} className="absolute -right-40 top-0 h-[560px] w-[560px] opacity-20 [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]">
          <Image src="/assets/congresso-comieadepa.jpg" alt="" fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(244,207,106,.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">Eventos oficiais</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] text-white sm:text-5xl">Eventos que edificam a história pentecostal do Pará.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/62">
              Da Assembleia Geral Ordinária aos congressos regionais, a COMIEADEPA promove encontros que fortalecem a fé, celebram mais de um século de história e mobilizam a obra missionária em todo o território paraense.
            </p>
          </div>
          <div className="mt-12 grid overflow-hidden border border-[#f4cf6a]/18 bg-white/[0.055] shadow-[0_28px_70px_rgba(0,0,0,.24)] backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative min-h-[310px]">
              <Image src="/assets/congresso-comieadepa.jpg" alt="Auditório em evento da COMIEADEPA" fill className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,15,10,.10),rgba(18,15,10,.72))]" />
            </div>
            <div className="relative overflow-hidden p-8 lg:p-10">
              <Image src="/assets/selo-125-ago.png" alt="" width={260} height={260} className="absolute -right-8 -top-10 h-64 w-64 object-contain opacity-18" />
              <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f4cf6a]">125ª AGO</p>
              <h3 className="mt-4 font-serif text-3xl font-black leading-tight text-white sm:text-4xl">Obreiro segundo o coração de Deus.</h3>
              <p className="mt-5 max-w-xl leading-8 text-white/64">
                A 125ª Assembleia Geral Ordinária é o maior evento convencional da COMIEADEPA, reunindo ministros credenciados, liderança e campos eclesiásticos de todo o Pará. Acompanhe a programação oficial, as deliberações e a cobertura completa deste marco histórico.
              </p>
              <a href={eventsPortalUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-3 border border-[#f4cf6a]/35 bg-[#f4cf6a]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f4cf6a] transition hover:bg-[#f4cf6a] hover:text-[#171006]">
                Acompanhar AGO
                <ArrowRight size={18} />
              </a>
              </div>
            </div>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {events.map((event, index) => (
              <article key={event.title} className="group relative min-h-[300px] overflow-hidden border border-white/10 bg-white/[0.055] p-7 backdrop-blur transition hover:-translate-y-2 hover:border-[#f4cf6a]/50 hover:bg-white/[0.08]">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#f4cf6a]" />
                <p className="font-serif text-7xl font-black text-white/10">0{index + 1}</p>
                <CalendarDays className="mt-8 text-[#f4cf6a]" size={30} />
                <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">{event.date}</p>
                <h3 className="mt-4 font-serif text-2xl font-bold text-white">{event.title}</h3>
                <p className="mt-4 leading-7 text-white/62">{event.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="noticias" className="relative overflow-hidden bg-[#211709] px-5 py-24 sm:px-8">
        <motion.div style={{ y: newsParallaxY }} className="absolute -inset-x-8 -inset-y-24">
          <Image src="/assets/congresso-comieadepa.jpg" alt="" fill className="object-cover opacity-22" />
        </motion.div>
        <div className="absolute inset-0 bg-[#211709]/76 backdrop-blur-[1px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">Notícias</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] text-white sm:text-5xl">A voz oficial da COMIEADEPA.</h2>
          </div>
          <div className="grid gap-4">
            {["Comunicados Oficiais da Convenção", "Cobertura da 125ª Assembleia Geral Ordinária", "Notas e Deliberações Convencioanais"].map((title) => (
              <a key={title} href="#" className="group flex items-center justify-between border border-white/12 bg-[#120f0a]/62 p-6 backdrop-blur-xl transition hover:border-[#f4cf6a]/60 hover:bg-[#120f0a]/82">
                <span className="font-serif text-2xl font-bold text-white">{title}</span>
                <ArrowRight className="text-[#f4cf6a] transition group-hover:translate-x-2" size={24} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#120f0a] px-5 py-24 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(244,207,106,.14),transparent_28%),radial-gradient(circle_at_86%_78%,rgba(139,47,43,.20),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">Vídeos</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] text-white sm:text-5xl">A convenção em movimento.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/62">
              Registros oficiais de congressos, assembleias e momentos marcantes da maior e mais histórica convenção assembleiana do Brasil.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((video, index) => (
              <article
                key={video.id}
                className="group relative overflow-hidden border border-white/10 bg-white/[0.055] p-3 shadow-[0_22px_60px_rgba(0,0,0,.22)] backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#f4cf6a]/45 hover:bg-white/[0.075]"
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between px-2 pb-2 pt-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f4cf6a]">{video.label}</p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-white">{video.title}</h3>
                  </div>
                  <span className="font-serif text-3xl font-black text-white/12">0{index + 1}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="departamentos" className="relative overflow-hidden bg-[#f7efd6] px-5 py-24 text-[#171006] sm:px-8">
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(135deg,rgba(139,47,43,.20)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute -right-24 top-0 h-full w-72 skew-x-[-16deg] bg-[#f4cf6a]/42" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8b2f2b]">Departamentos</p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-[1.03] sm:text-5xl">Ministérios e departamentos da convenção.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#5a472c]">
              A COMIEADEPA organiza sua missão por meio de ministérios especializados, cada um com propósito, identidade e compromisso com o crescimento da obra assembleiana no estado do Pará.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {departments.map((department, index) => (
              <motion.article
                key={department.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group relative min-h-[360px] overflow-hidden border border-[#d8c38b] bg-white/62 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)] backdrop-blur transition hover:-translate-y-2 hover:bg-white/90"
              >
                <div
                  className="absolute -right-10 top-0 h-full w-24 skew-x-[-16deg] opacity-20 transition group-hover:opacity-35"
                  style={{ backgroundColor: department.accent }}
                />
                <div
                  className="absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-10 blur-2xl"
                  style={{ backgroundColor: department.accent }}
                />
                <div className="relative flex h-44 items-center justify-center">
                  <Image
                    src={department.logo}
                    alt={`Logo ${department.title}`}
                    width={260}
                    height={180}
                    className="max-h-40 w-auto max-w-full object-contain drop-shadow-[0_18px_22px_rgba(23,16,6,.18)] transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative mt-6 border-t border-[#d8c38b]/70 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Departamento</p>
                  <h3 className="mt-2 font-serif text-3xl font-black">{department.title}</h3>
                  <p className="mt-4 leading-7 text-[#5a472c]">{department.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#120f0a] px-5 py-24 sm:px-8">
        <div className="absolute inset-0">
          <Image src="/assets/sede-comieadepa.png" alt="" fill className="object-cover opacity-10" />
          <div className="absolute inset-0 bg-[#120f0a]/88" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden border border-[#f4cf6a]/24 bg-[#1b140b]/64 shadow-[0_28px_70px_rgba(0,0,0,.24)] backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="p-8 lg:p-12">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">Área do Ministro</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-black leading-[1.03] text-white sm:text-5xl">O acesso ministerial continua no sistema oficial.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
              Ministros credenciados acessam o sistema oficial da COMIEADEPA para gestão de documentos, credenciais ministeriais, comunicados convencioanais e demais serviços institucionais. Utilize suas credenciais para entrar.
            </p>
          </div>
          <a href={ministerPortalUrl} className="flex h-full min-h-40 items-center justify-center bg-[#f4cf6a] px-12 text-sm font-black uppercase tracking-[0.16em] text-[#171006] transition hover:bg-white">
            Acessar portal
          </a>
        </div>
      </section>

      <footer id="contato" className="relative overflow-hidden border-t border-[#f4cf6a]/18 bg-[#120f0a] px-5 py-12 text-white sm:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,207,106,.10),transparent_34%,rgba(139,47,43,.16))]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(135deg,#f4cf6a_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute -right-16 top-0 h-full w-72 skew-x-[-16deg] bg-[#8b2f2b]/20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.1fr_0.7fr_1fr_0.95fr]">
          <div className="flex items-center justify-center md:justify-start">
            <Image src="/assets/logo-comieadepa.png" alt="Brasão COMIEADEPA" width={150} height={150} className="h-36 w-36 object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,.22)]" />
          </div>

          <nav className="grid gap-3 text-sm font-semibold text-white/92">
            <a href="#" className="w-fit border-b-2 border-[#f4cf6a] pb-1 text-[#f4cf6a]">Home</a>
            <a href="#a-comieadepa" className="transition hover:text-[#ffe28a]">Sobre Nós</a>
            <a href="#presidencia" className="transition hover:text-[#ffe28a]">Institucional</a>
            <a href="#eventos" className="transition hover:text-[#ffe28a]">Mídias</a>
            <a href="#noticias" className="transition hover:text-[#ffe28a]">Notícias</a>
            <a href="#contato" className="transition hover:text-[#ffe28a]">Contatos</a>
          </nav>

          <div>
            <h3 className="text-sm font-black">Contato</h3>
            <div className="mt-4 grid gap-4 text-sm text-white/92">
              <span className="inline-flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#f4cf6a]" />
                Rodovia Mário Covas, 2500
              </span>
              <span className="inline-flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-[#f4cf6a]" />
                55 (91) 0000-0000
              </span>
              <span className="inline-flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-[#f4cf6a]" />
                9h às 17h - Segunda a Sexta
              </span>
              <span className="inline-flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[#f4cf6a]" />
                secretaria@comieadepa.com.br
              </span>
              <a href="mailto:secretaria@comieadepa.com.br" className="w-fit border border-[#f4cf6a]/70 px-7 py-2 text-sm font-semibold text-[#f4cf6a] transition hover:bg-[#f4cf6a] hover:text-[#171006]">
                Fale conosco
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black">
              Siga-nos nas <span className="text-[#f4cf6a]">redes sociais</span>
            </h3>
            <div className="mt-5 flex gap-7">
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center bg-[#f4cf6a] text-[#171006] transition hover:-translate-y-1 hover:bg-white">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center bg-[#f4cf6a] text-[#171006] transition hover:-translate-y-1 hover:bg-white">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="grid h-9 w-9 place-items-center bg-[#f4cf6a] text-[#171006] transition hover:-translate-y-1 hover:bg-white">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}
