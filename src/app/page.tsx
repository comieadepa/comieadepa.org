"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Eye,
  Facebook,
  Instagram,
  Landmark,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const ministerPortalUrl = "https://www.siscomieadepa.org/login";
const eventsPortalUrl = "https://eventos.siscomieadepa.org/eventos-publicos";
const supabaseUrl = "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const navItems = ["A COMIEADEPA", "Presidência", "Eventos", "Notícias", "Departamentos", "Contato"];

const stats = [
  { value: "1921", label: "Fundada em" },
  { value: "100+", label: "Anos de história" },
  { value: "20 mil+", label: "Templos no Pará" },
  { value: "1ª", label: "Convenção assembleiana do Brasil" },
];

type EventCard = {
  title: string;
  category: string;
  day: string;
  month: string;
  time: string;
  location: string;
  attendees: string;
  status: "Inscrições Abertas" | "Em Breve" | "Encerrado";
  actionLabel: string;
  image: string;
  url: string;
};

type SupabaseEvent = {
  id: string;
  nome: string;
  slug: string | null;
  descricao: string | null;
  departamento: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  local: string | null;
  cidade: string | null;
  banner_url: string | null;
  valor_inscricao: number | null;
  inscricoes_abertas: boolean | null;
  publico_alvo: string | null;
  status: string | null;
  usar_tipos_inscricao: boolean | null;
  registrationTypes?: EventRegistrationType[];
};

type EventRegistrationType = {
  evento_id: string;
  nome: string | null;
  valor: number | null;
};

const fallbackEvents: EventCard[] = [
  {
    title: "Treinamento Regional AD Curralinho",
    category: "SEIADEPA",
    day: "23",
    month: "Maio",
    time: "Consultar no portal",
    location: "Curralinho - PA",
    attendees: "Inscrições abertas",
    status: "Inscrições Abertas",
    actionLabel: "Inscrever-se",
    image: "/assets/congresso-comieadepa.jpg",
    url: eventsPortalUrl,
  },
  {
    title: "Congresso UMADESPA 2026 - Belém",
    category: "UMADESPA",
    day: "17",
    month: "Julho",
    time: "Consultar no portal",
    location: "Belém - PA",
    attendees: "Inscrições abertas",
    status: "Inscrições Abertas",
    actionLabel: "Inscrever-se",
    image: "/assets/departamento-conec.png",
    url: eventsPortalUrl,
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
    text: "Associação de esposas de ministros, fortalecendo comunhão, cuidado e apoio às famílias ministeriais.",
    accent: "#b46b2b",
  },
  {
    logo: "/assets/departamento-qgu.png",
    title: "QGU",
    text: "Quartel General UMADESPA, mobilizando a juventude para serviço, unidade e compromisso com a obra.",
    accent: "#425f32",
  },
];

const videos = [
  { id: "SfBqj_dhhgw", title: "Cobertura oficial", label: "Shorts" },
  { id: "YJ6-AG7c0ww", title: "Momentos da convenção", label: "Shorts" },
  { id: "Mg07zDoUVhs", title: "Registro institucional", label: "Shorts" },
  { id: "Ko3czCnuasY", title: "Destaque da AGO", label: "Shorts" },
];

const eventVideos = [
  {
    title: "125ª AGO - Abertura Oficial",
    subtitle: "COMIEADEPA Oficial",
    views: "15.3K",
    date: "Julho 2025",
    image: "/assets/congresso-comieadepa.jpg",
    url: "https://www.youtube.com/shorts/SfBqj_dhhgw",
  },
  {
    title: "Congresso de Ministros",
    subtitle: "Palavra e Comunhão",
    views: "8.2K",
    date: "Julho 2025",
    image: "/assets/sede-comieadepa.png",
    url: "https://www.youtube.com/shorts/YJ6-AG7c0ww",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventCards, setEventCards] = useState<EventCard[]>(supabaseAnonKey ? [] : fallbackEvents);
  const [eventsLoading, setEventsLoading] = useState(Boolean(supabaseAnonKey));
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 900], [0, 150]);
  const heroCopyY = useTransform(scrollY, [0, 900], [0, 42]);
  const heroVisualY = useTransform(scrollY, [0, 900], [0, -72]);
  const sedeParallaxY = useTransform(scrollY, [260, 1450], [-70, 92]);
  const newsParallaxY = useTransform(scrollY, [1500, 2600], [-90, 70]);

  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseEvents() {
      if (!supabaseAnonKey) {
        return;
      }

      try {
        const params = new URLSearchParams({
          select: "id,nome,slug,descricao,departamento,data_inicio,data_fim,local,cidade,banner_url,valor_inscricao,inscricoes_abertas,publico_alvo,status,usar_tipos_inscricao",
          order: "data_inicio.asc",
          limit: "4",
        });

        const response = await fetch(`${supabaseUrl}/rest/v1/eventos?${params.toString()}`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Supabase retornou ${response.status}`);
        }

        const data = (await response.json()) as SupabaseEvent[];
        const registrationTypes = await loadEventRegistrationTypes(data.map((event) => event.id));
        const eventsWithTypes = data.map((event) => ({
          ...event,
          registrationTypes: registrationTypes.filter((type) => type.evento_id === event.id),
        }));
        const mappedEvents = eventsWithTypes.map(mapSupabaseEventToCard);

        if (isMounted && mappedEvents.length > 0) {
          setEventCards(mappedEvents);
        }
      } catch (error) {
        console.warn("Não foi possível carregar eventos do Supabase.", error);
        if (isMounted) {
          setEventCards(fallbackEvents);
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    }

    loadSupabaseEvents();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ y: heroCopyY }} className="relative z-20 max-w-3xl min-w-0">
            <div className="mb-6 inline-flex items-center gap-3 border border-[#f4cf6a]/45 bg-black/22 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#f4cf6a] shadow-[0_16px_40px_rgba(0,0,0,.18)] backdrop-blur-md">
              <Sparkles size={16} />
              Berço do pentecostes no Brasil
            </div>
            <h1 className="max-w-full font-serif text-[clamp(3.05rem,15.5vw,7.4rem)] font-black leading-[0.86] text-white drop-shadow-[0_14px_38px_rgba(0,0,0,.45)] sm:text-[clamp(4.3rem,8vw,7.4rem)]">
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
              className="mt-7 flex max-w-full items-center gap-3 border border-[#f4cf6a]/22 bg-[#120f0a]/42 p-4 shadow-[0_18px_44px_rgba(0,0,0,.22)] backdrop-blur-xl sm:max-w-xl sm:gap-4"
            >
              <Image src="/assets/selo-125-ago.png" alt="Selo da 125ª AGO" width={82} height={82} className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(244,207,106,.28)] sm:h-20 sm:w-20" />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f4cf6a]">Próxima AGO</p>
                <p className="mt-1 font-serif text-xl font-black leading-tight text-white sm:text-2xl">125ª Assembleia Geral Ordinária</p>
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
          {stats.map((stat, index) => (
            <div key={stat.label} className={`relative overflow-hidden border-b border-[#f4cf6a]/12 p-7 md:border-b-0 md:border-r ${index > 1 ? "hidden md:block" : ""}`}>
              <p className="font-serif text-5xl font-black text-[#f4cf6a]">{stat.value}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-white/58">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="a-comieadepa" className="relative bg-[#120f0a] px-5 py-28 sm:px-8">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,#f4cf6a_1px,transparent_1px)] [background-size:42px_42px]" />
        <motion.div style={{ y: sedeParallaxY }} className="absolute -right-24 top-10 hidden h-[520px] w-[520px] border border-[#f4cf6a]/12 bg-[#f4cf6a]/5 backdrop-blur-sm lg:block [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -72 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.34 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="relative min-h-[560px]"
          >
            <motion.div
              style={{ y: sedeParallaxY }}
              className="absolute left-0 top-6 h-[430px] w-[86%] overflow-hidden border border-[#f4cf6a]/22 bg-[#221a0f] shadow-[0_46px_100px_rgba(0,0,0,.42)] [clip-path:polygon(0_0,100%_0,88%_100%,0_92%)]"
            >
              <Image src="/assets/sede-aerea-comieadepa.jpg" alt="Sede aérea da COMIEADEPA" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,207,106,.02)_0%,rgba(244,207,106,.23)_56%,rgba(18,15,10,.78)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(255,255,255,.20),transparent_26%)]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-1 top-20 z-20 grid h-[268px] w-[268px] place-items-center rounded-full bg-[#120f0a]/12"
            >
              <div className="absolute inset-8 rounded-full bg-[#f4cf6a]/20 blur-2xl" />
              <Image
                src="/assets/selo-comieadepa-dourado.png"
                alt="Selo dourado COMIEADEPA"
                width={330}
                height={330}
                className="relative h-[252px] w-[252px] object-contain drop-shadow-[0_26px_36px_rgba(0,0,0,.48)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: 0.18, duration: 0.72, ease: "easeOut" }}
              className="absolute bottom-2 right-6 z-30 w-[58%] min-w-[270px] border border-[#f4cf6a]/35 bg-[linear-gradient(135deg,rgba(255,232,151,.96),rgba(194,146,51,.90))] p-7 text-[#171006] shadow-[0_24px_64px_rgba(0,0,0,.38)] backdrop-blur"
            >
              <div className="flex items-center justify-between gap-4">
                <Landmark size={30} />
                <span className="h-px flex-1 bg-[#171006]/24" />
                <span className="text-xs font-black uppercase tracking-[0.18em]">Desde</span>
              </div>
              <p className="mt-6 font-serif text-4xl font-black leading-none">18.08.1921</p>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.16em]">Berço do pentecostes no Brasil</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 64 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.34 }}
            transition={{ duration: 0.82, ease: "easeOut" }}
          >
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">A COMIEADEPA</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-[1.02] text-white sm:text-5xl">
              A primeira convenção assembleiana do Brasil.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
              Fundada em 18 de agosto de 1921, a COMIEADEPA é reconhecida como a primeira convenção das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo clássico floresceu, a convenção reúne milhares de ministros, igrejas e congregações em centenas de campos eclesiásticos por todo o Pará — reconhecida como Patrimônio Cultural Material e Imaterial do Estado.
            </p>
            <div className="mt-9 hidden gap-4 sm:grid sm:grid-cols-3">
              {["Evangelismo", "Missões", "Ação Social"].map((item) => (
                <div key={item} className="border border-white/10 bg-white/[0.055] p-5 backdrop-blur transition hover:bg-white/[0.085]">
                  <ShieldCheck className="text-[#f4cf6a]" size={22} />
                  <p className="mt-5 font-serif text-2xl font-bold text-white">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="presidencia" className="relative overflow-hidden bg-[#26231f] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(244,207,106,.16),transparent_30%),linear-gradient(90deg,rgba(18,15,10,.24),transparent_45%,rgba(244,207,106,.08))]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(circle_at_center,#fff_1.2px,transparent_1.2px)] [background-size:30px_30px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.98fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -110 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -left-6 -top-7 z-20 grid h-16 w-16 place-items-center rounded-xl bg-[#f2a000] text-white shadow-[0_16px_36px_rgba(242,160,0,.28)]">
              <Quote size={32} strokeWidth={3} />
            </div>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#11100f] shadow-[16px_16px_0_rgba(242,160,0,.22),0_28px_80px_rgba(0,0,0,.34)]">
              <div className="relative min-h-[520px]">
                <Image
                  src="/assets/presidente-comieadepa.png"
                  alt="Pr. Océlio Nauar e esposa"
                  fill
                  className="object-contain object-bottom"
                />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(17,16,15,.96),rgba(17,16,15,0))]" />
                <div className="absolute bottom-8 left-7">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#f2a000]">Presidente</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Pr. Océlio Nauar</h3>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 110 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex rounded-full bg-[#f2a000]/16 px-5 py-2 text-sm font-black uppercase tracking-[0.08em] text-[#f2a000]">
              Palavra do Presidente
            </span>
            <h2 className="mt-8 text-5xl font-black leading-[0.98] text-white sm:text-6xl">
              Servindo com <br />
              <span className="text-[#f2a000]">Integridade</span> e Fidelidade
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-white/84">
              <p>
                A COMIEADEPA segue firme no propósito de servir a Deus com integridade, unidade e compromisso com a Palavra.
              </p>
              <p>
                A cada pastor, líder e membro, reafirmamos: sua dedicação não é em vão. Mesmo diante dos desafios, Deus sustenta e honra os que O servem com fidelidade.
              </p>
              <p className="font-semibold text-white">
                Sigamos em oração, com visão espiritual e amor pelas almas. O Senhor é conosco e maiores ainda são as obras que Ele realizará!
              </p>
            </div>
            <div className="my-9 h-px w-full bg-white/12" />
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f2a000] text-xl font-black text-white">
                ON
              </div>
              <div>
                <p className="font-black text-white">Pr. Océlio Nauar</p>
                <p className="text-white/62">Presidente COMIEADEPA</p>
              </div>
            </div>
          </motion.div>
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
              A agenda convencional reúne assembleias, congressos, capacitações e encontros ministeriais que organizam a comunhão da obra, fortalecem departamentos e conectam ministros, igrejas e regiões em torno da missão da COMIEADEPA.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {eventsLoading &&
              [0, 1].map((item) => (
                <article
                  key={item}
                  className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-xl bg-white/92 text-[#171006] shadow-[0_18px_38px_rgba(0,0,0,.22)]"
                >
                  <div className="relative h-48 overflow-hidden bg-[#211709]">
                    <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#24180c_0%,#4b3518_45%,#24180c_90%)] opacity-90" />
                    <span className="absolute right-4 top-4 h-7 w-32 rounded-md bg-[#00b67a]/30" />
                    <div className="absolute bottom-5 left-5 h-[70px] w-20 rounded-lg bg-white/82 shadow-[0_10px_26px_rgba(0,0,0,.18)]" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="h-7 w-4/5 rounded bg-[#171006]/12" />
                    <div className="mt-3 h-7 w-2/3 rounded bg-[#171006]/12" />
                    <div className="mt-5 h-4 w-28 rounded bg-[#171006]/10" />
                    <div className="mt-8 grid gap-4">
                      <div className="h-4 w-3/5 rounded bg-[#171006]/10" />
                      <div className="h-4 w-4/5 rounded bg-[#171006]/10" />
                      <div className="h-4 w-2/3 rounded bg-[#171006]/10" />
                    </div>
                    <div className="mt-auto h-12 w-full rounded-full bg-[#171006]/18" />
                  </div>
                </article>
              ))}
            {eventCards.map((event, index) => (
              <motion.article
                key={event.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group flex h-full min-h-[560px] flex-col overflow-hidden rounded-xl bg-white text-[#171006] shadow-[0_18px_38px_rgba(0,0,0,.22)] transition hover:-translate-y-2 hover:shadow-[0_26px_54px_rgba(0,0,0,.30)]"
              >
                <div className="relative h-48 overflow-hidden bg-[#171006]">
                  <Image src={event.image} alt={event.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,15,10,.28),rgba(18,15,10,.02))]" />
                  <span className={`absolute right-4 top-4 rounded-md px-3 py-1 text-xs font-black text-white ${event.status === "Em Breve" ? "bg-[#f2a000]" : "bg-[#00b67a]"}`}>
                    {event.status}
                  </span>
                  <div className="absolute bottom-5 left-5 rounded-lg bg-white px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,.18)]">
                    <p className="text-sm font-semibold text-[#d97a00]">{event.day}</p>
                    <p className="text-xl font-black">{event.month}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className={`text-xl font-black uppercase leading-tight ${event.title === "Treinamento EBD" ? "text-[#d97a00]" : "text-[#171006]"}`}>
                    {event.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#6a5943]">{event.category}</p>

                  <div className="mt-5 grid gap-3 text-sm text-[#3e3427]">
                    <span className="inline-flex items-center gap-3">
                      <Clock size={16} className="text-[#f2a000]" />
                      {event.time}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <MapPin size={16} className="text-[#f2a000]" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <Users size={16} className="text-[#f2a000]" />
                      {event.attendees}
                    </span>
                  </div>

                  <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${event.actionLabel} - ${event.title}`}
                    className={`mt-auto inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-black transition ${
                      event.status === "Em Breve"
                        ? "border border-[#d6b761]/45 bg-[#efe1b6] !text-[#171006] hover:bg-[#f4cf6a]"
                        : "bg-[#171006] !text-white hover:bg-[#f2a000] hover:!text-[#171006]"
                    }`}
                  >
                    {event.actionLabel}
                    <ArrowRight size={18} />
                  </a>
                </div>
              </motion.article>
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
                className={`group relative overflow-hidden border border-white/10 bg-white/[0.055] p-3 shadow-[0_22px_60px_rgba(0,0,0,.22)] backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#f4cf6a]/45 hover:bg-white/[0.075] ${index > 0 ? "hidden sm:block" : ""}`}
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
              <h2 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-[1.03] sm:text-5xl">Conselhos, comissões e departamentos da convenção.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#5a472c]">
              Uma rede de trabalho que sustenta a vida convencional: formação, cuidado, juventude, ensino e serviço caminhando juntos para fortalecer igrejas, famílias ministeriais e a missão em todo o Pará.
            </p>
          </div>
          <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {departments.map((department, index) => (
              <motion.article
                key={department.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group relative min-h-[360px] w-[82vw] shrink-0 snap-start overflow-hidden border border-[#d8c38b] bg-white/62 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)] backdrop-blur transition hover:-translate-y-2 hover:bg-white/90 sm:w-[360px] lg:w-[305px]"
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

      <section className="relative overflow-hidden bg-[#17130f] px-5 py-24 text-white sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(139,47,43,.18),transparent_28%),linear-gradient(180deg,#17130f_0%,#211c18_54%,#17130f_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:34px_34px]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e62b2b]/18 px-5 py-2 text-sm font-black text-[#ff6b6b]">
              <Youtube size={16} />
              YouTube
            </span>
            <h2 className="mt-6 text-5xl font-black leading-tight text-white sm:text-6xl">Assista Nossos Eventos</h2>
            <p className="mt-4 text-lg text-white/64">
              Confira transmissões, gravações e registros oficiais dos congressos, assembleias e reuniões ministeriais.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
            {eventVideos.map((video, index) => (
              <motion.article
                key={video.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className="group overflow-hidden rounded-xl bg-[#2a2522] shadow-[0_24px_60px_rgba(0,0,0,.28)] transition hover:-translate-y-2"
              >
                <a href={video.url} target="_blank" rel="noreferrer" className="block">
                  <div className="relative h-72 overflow-hidden bg-black">
                    <Image src={video.image} alt={video.title} fill className="object-cover opacity-72 transition duration-700 group-hover:scale-105 group-hover:opacity-88" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.42),rgba(0,0,0,.08))]" />
                    <span className="absolute bottom-5 right-5 rounded bg-black/80 px-3 py-1 text-xs font-black uppercase text-white">Live</span>
                    <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e62b2b] text-white shadow-[0_18px_44px_rgba(230,43,43,.30)] transition group-hover:scale-110">
                      <Play size={34} fill="currentColor" />
                    </span>
                  </div>
                  <div className="grid grid-cols-[48px_1fr] gap-5 p-7">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e62b2b]/22 text-[#ff4c4c]">
                      <Youtube size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase text-white">{video.title}</h3>
                      <p className="mt-2 text-sm uppercase tracking-[0.08em] text-white/62">{video.subtitle}</p>
                      <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/38">
                        <span className="inline-flex items-center gap-2">
                          <Eye size={16} />
                          {video.views}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={16} />
                          {video.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://www.youtube.com/@comieadepa"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#e62b2b] px-8 py-4 text-sm font-black !text-white transition hover:-translate-y-1 hover:bg-[#ff3838]"
            >
              <Youtube size={18} />
              Inscreva-se no Canal
            </a>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/36">
              <Users size={16} />
              15.3K inscritos
            </p>
          </div>
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

function mapSupabaseEventToCard(event: SupabaseEvent): EventCard {
  const date = parseSupabaseDate(event.data_inicio);
  const department = event.departamento?.trim() || "COMIEADEPA";
  const title = titleCase(event.nome);
  const status = getEventStatus(event);

  return {
    title,
    category: department,
    day: date.day,
    month: date.month,
    time: "Consultar no portal",
    location: inferEventLocation(event),
    attendees: formatEventRegistration(event),
    status,
    actionLabel: status === "Inscrições Abertas" ? "Inscrever-se" : status === "Encerrado" ? "Ver detalhes" : "Acompanhar abertura",
    image: getEventImage(event),
    url: eventsPortalUrl,
  };
}

async function loadEventRegistrationTypes(eventIds: string[]) {
  if (!supabaseAnonKey || eventIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    select: "evento_id,nome,valor",
    evento_id: `in.(${eventIds.join(",")})`,
    order: "valor.asc",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/evento_tipos_inscricao?${params.toString()}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    console.warn(`Supabase retornou ${response.status} ao buscar tipos de inscrição.`);
    return [];
  }

  return (await response.json()) as EventRegistrationType[];
}

function parseSupabaseDate(value: string | null) {
  if (!value) {
    return { day: "--", month: "Em breve" };
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date),
  };
}

function titleCase(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s|-)\p{L}/gu, (match) => match.toLocaleUpperCase("pt-BR"))
    .replace(/\bAd\b/g, "AD")
    .replace(/\bAgo\b/g, "AGO")
    .replace(/\bEbd\b/g, "EBD")
    .replace(/\bUmadespa\b/g, "UMADESPA")
    .replace(/\bComieadepa\b/g, "COMIEADEPA");
}

function inferEventLocation(event: SupabaseEvent) {
  const local = event.local?.trim();
  const city = event.cidade?.trim();

  if (local && city) {
    return `${titleCase(local)} - ${titleCase(city)}`;
  }

  if (local) {
    return titleCase(local);
  }

  if (city) {
    return titleCase(city);
  }

  return event.departamento || "COMIEADEPA";
}

function getEventImage(event: SupabaseEvent) {
  if (event.banner_url) {
    return event.banner_url;
  }

  const text = `${event.nome} ${event.departamento ?? ""}`.toLocaleLowerCase("pt-BR");

  if (text.includes("seiadepa")) {
    return "/assets/departamento-seiadepa.png";
  }

  if (text.includes("umadespa")) {
    return "/assets/congresso-comieadepa.jpg";
  }

  if (text.includes("conec") || text.includes("ebd")) {
    return "/assets/departamento-conec.png";
  }

  return "/assets/congresso-comieadepa.jpg";
}

function getEventStatus(event: SupabaseEvent): EventCard["status"] {
  const status = event.status?.toLocaleLowerCase("pt-BR");

  if (status === "encerrado" || status === "finalizado" || status === "cancelado") {
    return "Encerrado";
  }

  if (event.inscricoes_abertas) {
    return "Inscrições Abertas";
  }

  return "Em Breve";
}

function formatEventRegistration(event: SupabaseEvent) {
  if (!event.inscricoes_abertas) {
    return "Inscrições em breve";
  }

  const lowestTypeValue = getLowestRegistrationTypeValue(event.registrationTypes);

  if (event.usar_tipos_inscricao && lowestTypeValue !== null) {
    return `Inscrição a partir de ${formatCurrency(lowestTypeValue)}`;
  }

  if (!event.valor_inscricao || Number(event.valor_inscricao) === 0) {
    return "Inscrição gratuita";
  }

  return `Inscrição: ${formatCurrency(Number(event.valor_inscricao))}`;
}

function getLowestRegistrationTypeValue(types: EventRegistrationType[] | undefined) {
  const values = (types ?? [])
    .map((type) => Number(type.valor))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return null;
  }

  return Math.min(...values);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
