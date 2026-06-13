"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Eye,
  Landmark,
  MapPin,
  Play,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  defaultPublicSiteConfig,
  mapPublicSiteSettings,
  PublicLayout,
  type PublicSiteConfig,
} from "@/components/site/PublicLayout";
import { CmsHomeSlide } from "@/lib/home-slides";

const eventsPortalUrl = "https://eventos.siscomieadepa.org/eventos-publicos";
const supabaseUrl = "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSiteSchema = process.env.NEXT_PUBLIC_SUPABASE_SITE_SCHEMA ?? "site";

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

type PortalVideo = {
  id: string;
  title: string;
  label: string;
};

type PortalDepartment = {
  slug: string;
  logo: string;
  title: string;
  text: string;
  accent: string;
};

type CmsVideo = {
  id: string;
  titulo: string | null;
  youtube_id: string | null;
  youtube_url: string | null;
  tipo: string | null;
  departamento_id: string | null;
};

type PortalNews = {
  title: string;
  category: string;
  url: string;
  date: string;
  image: string;
};

type CmsPost = {
  id: string;
  titulo: string | null;
  slug: string | null;
  resumo: string | null;
  capa_url: string | null;
  categoria_id: string | null;
  departamento_id: string | null;
  publicado_em: string | null;
  created_at: string | null;
};

type CmsLookup = {
  id: string;
  nome: string | null;
};

type CmsDepartmentCard = CmsLookup & {
  slug: string;
  titulo: string | null;
  resumo: string | null;
  logo_url: string | null;
};

type CmsSetting = {
  chave: string;
  valor: unknown;
};

type PortalHomeContent = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroText: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  heroSecondaryLabel: string;
  agoBadge: string;
  agoTitle: string;
  aboutBadge: string;
  aboutTitle: string;
  aboutText: string;
  aboutImageUrl: string;
  aboutSealUrl: string;
  aboutDate: string;
  aboutCaption: string;
  aboutPillars: string[];
  presidencyImageUrl: string;
  presidencyName: string;
  presidencyRole: string;
  presidencyInitials: string;
  presidencyBadge: string;
  presidencyTitleLine1: string;
  presidencyTitleHighlight: string;
  presidencyTitleLine2: string;
  presidencyParagraphs: string[];
  eventsBadge: string;
  eventsTitle: string;
  eventsText: string;
  newsBadge: string;
  newsTitle: string;
  videosBadge: string;
  videosTitle: string;
  videosText: string;
  videosButtonLabel: string;
  departmentsBadge: string;
  departmentsTitle: string;
  departmentsText: string;
  eventVideosBadge: string;
  eventVideosTitle: string;
  eventVideosText: string;
  eventVideosButtonLabel: string;
  eventVideosSubscribers: string;
};

type HomePageClientProps = {
  initialSlides: CmsHomeSlide[];
};

type HomeHeroSlideView = {
  id: string;
  dataLabel: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  openInNewTab: boolean;
};

const defaultPortalHomeContent: PortalHomeContent = {
  heroBadge: "Berço do pentecostes no Brasil",
  heroTitle: "COMIEADEPA",
  heroSubtitle: "A primeira convenção assembleiana do Brasil, fundada em 18 de agosto de 1921, no estado do Pará.",
  heroText:
    "Mais de cem anos proclamando o Evangelho, reunindo ministros, igrejas e congregações em todo o Pará. Uma convenção edificada sobre fé, missão e fidelidade inabalável à Palavra de Deus.",
  heroPrimaryLabel: "Conheça a história",
  heroPrimaryUrl: "#a-comieadepa",
  heroSecondaryLabel: "Eventos oficiais",
  agoBadge: "Próxima AGO",
  agoTitle: "125ª Assembleia Geral Ordinária",
  aboutBadge: "A COMIEADEPA",
  aboutTitle: "A primeira convenção assembleiana do Brasil.",
  aboutText:
    "Fundada em 18 de agosto de 1921, a COMIEADEPA é reconhecida como a primeira convenção das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo clássico floresceu, a convenção reúne milhares de ministros, igrejas e congregações em centenas de campos eclesiásticos por todo o Pará — reconhecida como Patrimônio Cultural Material e Imaterial do Estado.",
  aboutImageUrl: "/assets/sede-aerea-comieadepa.jpg",
  aboutSealUrl: "/assets/selo-comieadepa-dourado.png",
  aboutDate: "18.08.1921",
  aboutCaption: "Berço do pentecostes no Brasil",
  aboutPillars: ["Evangelismo", "Missões", "Ação Social"],
  presidencyImageUrl: "/assets/presidente-comieadepa.png",
  presidencyName: "Pr. Océlio Nauar",
  presidencyRole: "Presidente COMIEADEPA",
  presidencyInitials: "ON",
  presidencyBadge: "Palavra do Presidente",
  presidencyTitleLine1: "Servindo com",
  presidencyTitleHighlight: "Integridade",
  presidencyTitleLine2: "e Fidelidade",
  presidencyParagraphs: [
    "A COMIEADEPA segue firme no propósito de servir a Deus com integridade, unidade e compromisso com a Palavra.",
    "A cada pastor, líder e membro, reafirmamos: sua dedicação não é em vão. Mesmo diante dos desafios, Deus sustenta e honra os que O servem com fidelidade.",
    "Sigamos em oração, com visão espiritual e amor pelas almas. O Senhor é conosco e maiores ainda são as obras que Ele realizará!",
  ],
  eventsBadge: "Eventos oficiais",
  eventsTitle: "Eventos que edificam a história pentecostal do Pará.",
  eventsText:
    "A agenda convencional reúne assembleias, congressos, capacitações e encontros ministeriais que organizam a comunhão da obra, fortalecem departamentos e conectam ministros, igrejas e regiões em torno da missão da COMIEADEPA.",
  newsBadge: "Notícias",
  newsTitle: "A voz oficial da COMIEADEPA.",
  videosBadge: "Vídeos",
  videosTitle: "A convenção em movimento.",
  videosText: "Registros oficiais de congressos, assembleias e momentos marcantes da maior e mais histórica convenção assembleiana do Brasil.",
  videosButtonLabel: "Ver todos os vídeos",
  departmentsBadge: "Departamentos",
  departmentsTitle: "Conselhos, comissões e departamentos da convenção.",
  departmentsText:
    "Uma rede de trabalho que sustenta a vida convencional: formação, cuidado, juventude, ensino e serviço caminhando juntos para fortalecer igrejas, famílias ministeriais e a missão em todo o Pará.",
  eventVideosBadge: "YouTube",
  eventVideosTitle: "Assista Nossos Eventos",
  eventVideosText: "Confira transmissões, gravações e registros oficiais dos congressos, assembleias e reuniões ministeriais.",
  eventVideosButtonLabel: "Inscreva-se no Canal",
  eventVideosSubscribers: "15.3K inscritos",
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

const fallbackDepartmentCards: PortalDepartment[] = [
  {
    slug: "seiadepa",
    logo: "/assets/departamento-seiadepa.png",
    title: "SEIADEPA",
    text: "Departamento infantil, ensino bíblico e formação cristã para crianças.",
    accent: "#2aa8e8",
  },
  {
    slug: "conec",
    logo: "/assets/departamento-conec.png",
    title: "CONEC",
    text: "Conselho de Educação Cristã, ensino, currículo e fortalecimento bíblico.",
    accent: "#c89a2d",
  },
  {
    slug: "aemadepa",
    logo: "/assets/departamento-aemadepa.png",
    title: "AEMADEPA",
    text: "Associação de esposas de ministros, fortalecendo comunhão, cuidado e apoio às famílias ministeriais.",
    accent: "#b46b2b",
  },
  {
    slug: "qgu",
    logo: "/assets/departamento-qgu.png",
    title: "QGU",
    text: "Quartel General UMADESPA, mobilizando a juventude para serviço, unidade e compromisso com a obra.",
    accent: "#425f32",
  },
];

const fallbackVideos: PortalVideo[] = [
  { id: "SfBqj_dhhgw", title: "Cobertura oficial", label: "Shorts" },
  { id: "YJ6-AG7c0ww", title: "Momentos da convenção", label: "Shorts" },
  { id: "Mg07zDoUVhs", title: "Registro institucional", label: "Shorts" },
  { id: "Ko3czCnuasY", title: "Destaque da AGO", label: "Shorts" },
];

const fallbackNews: PortalNews[] = [
  {
    title: "Comunicados Oficiais da Convenção",
    category: "Notícia",
    url: "#",
    date: "06 de julho de 2025",
    image: "/assets/sede-aerea-comieadepa.jpg",
  },
  {
    title: "Cobertura da 125ª Assembleia Geral Ordinária",
    category: "Notícia",
    url: "#",
    date: "13 de março de 2024",
    image: "/assets/congresso-comieadepa.jpg",
  },
  {
    title: "Notas e Deliberações Convencionais",
    category: "Notícia",
    url: "#",
    date: "28 de junho de 2023",
    image: "/assets/sede-comieadepa.png",
  },
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

export function HomePageClient({ initialSlides }: HomePageClientProps) {
  const [eventCards, setEventCards] = useState<EventCard[]>(supabaseAnonKey ? [] : fallbackEvents);
  const [eventsLoading, setEventsLoading] = useState(Boolean(supabaseAnonKey));
  const [portalVideos, setPortalVideos] = useState<PortalVideo[]>(fallbackVideos);
  const [portalNews, setPortalNews] = useState<PortalNews[]>(fallbackNews);
  const [portalDepartments, setPortalDepartments] = useState<PortalDepartment[]>(fallbackDepartmentCards);
  const [portalConfig, setPortalConfig] = useState<PublicSiteConfig>(defaultPublicSiteConfig);
  const [portalHomeContent, setPortalHomeContent] = useState<PortalHomeContent>(defaultPortalHomeContent);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
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

        const data = await fetchSupabasePublic<SupabaseEvent>("v_eventos_publicos", params.toString());
        const registrationTypes = await loadEventRegistrationTypes(data.map((event) => event.id));
        const eventsWithTypes = data.map((event) => ({
          ...event,
          registrationTypes: registrationTypes.filter((type) => type.evento_id === event.id),
        }));
        const mappedEvents = eventsWithTypes
          .filter((event) => isEventVisibleOnHome(event))
          .sort((a, b) => getEventSortTimestamp(a) - getEventSortTimestamp(b))
          .map(mapSupabaseEventToCard)
          .slice(0, 4);

        if (isMounted && mappedEvents.length > 0) {
          setEventCards(mappedEvents);
        }
      } catch (error) {
        console.warn("Não foi possível carregar eventos.", error);
        if (isMounted) {
          setEventCards(fallbackEvents);
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    }

    async function loadCmsPublicContent() {
      if (!supabaseAnonKey) {
        return;
      }

      try {
        const [videosResponse, postsResponse, categoriesResponse, departmentsResponse, settingsResponse] = await Promise.all([
          fetchSupabasePublic<CmsVideo>(
            "cms_videos",
            "select=id,titulo,youtube_id,youtube_url,tipo,departamento_id&ativo=eq.true&destaque_home=eq.true&order=ordem.asc.nullslast,created_at.desc&limit=4",
          ),
          fetchSupabasePublic<CmsPost>(
            "cms_posts",
            `select=id,titulo,slug,resumo,capa_url,categoria_id,departamento_id,publicado_em,created_at&status=eq.publicado&destaque_home=eq.true${getPublishedPostsPublicFilter()}&order=publicado_em.desc.nullslast,created_at.desc&limit=3`,
          ),
          fetchSupabasePublic<CmsLookup>("cms_categorias", "select=id,nome&order=nome.asc"),
          fetchSupabasePublic<CmsDepartmentCard>("cms_departamentos", "select=id,slug,nome,titulo,resumo,logo_url&ativo=eq.true&order=ordem.asc,nome.asc"),
          fetchSupabasePublic<CmsSetting>("cms_configuracoes", "select=chave,valor&publico=eq.true"),
        ]);

        const categoryMap = buildCmsLookupMap(categoriesResponse);
        const departmentMap = buildCmsLookupMap(departmentsResponse);
        const mappedVideos = videosResponse.map((video) => mapCmsVideoToPortalVideo(video, departmentMap)).filter(Boolean) as PortalVideo[];
        const mappedNews = postsResponse.map((post) => mapCmsPostToPortalNews(post, categoryMap, departmentMap)).filter(Boolean) as PortalNews[];
        const mappedDepartments = departmentsResponse.map(mapCmsDepartmentToPortalDepartment);
        const mappedConfig = mapPublicSiteSettings(settingsResponse);
        const mappedHomeContent = mapCmsSettingsToPortalHomeContent(settingsResponse);

        if (isMounted) {
          setPortalConfig(mappedConfig);
          setPortalHomeContent(mappedHomeContent);
        }

        if (isMounted && mappedVideos.length > 0) {
          setPortalVideos(mappedVideos);
        }

        if (isMounted && mappedNews.length > 0) {
          setPortalNews(mappedNews);
        }

        if (isMounted && mappedDepartments.length > 0) {
          setPortalDepartments(mappedDepartments);
        }
      } catch (error) {
        console.warn("Não foi possível carregar conteúdo do CMS.", error);
      }
    }

    loadSupabaseEvents();
    loadCmsPublicContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroSlides: HomeHeroSlideView[] =
    initialSlides.length > 0
      ? initialSlides.map((slide) => ({
          id: slide.id,
          dataLabel: slide.data_label?.trim() || portalHomeContent.heroBadge,
          title: slide.titulo,
          subtitle: slide.subtitulo?.trim() || portalHomeContent.heroSubtitle,
          description: slide.descricao?.trim() || portalHomeContent.heroText,
          imageUrl: slide.imagem_url,
          buttonText: slide.botao_texto?.trim() || portalHomeContent.heroPrimaryLabel,
          buttonUrl: slide.botao_url?.trim() || portalHomeContent.heroPrimaryUrl,
          openInNewTab: slide.abrir_nova_aba,
        }))
      : [
          {
            id: "fallback-hero",
            dataLabel: portalHomeContent.heroBadge,
            title: portalHomeContent.heroTitle,
            subtitle: portalHomeContent.heroSubtitle,
            description: portalHomeContent.heroText,
            imageUrl: "/assets/congresso-comieadepa.jpg",
            buttonText: portalHomeContent.heroPrimaryLabel,
            buttonUrl: portalHomeContent.heroPrimaryUrl,
            openInNewTab: false,
          },
        ];

  const currentHeroSlide = heroSlides[currentHeroIndex] ?? heroSlides[0];

  useEffect(() => {
    setCurrentHeroIndex(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <PublicLayout>
      <main className="min-h-screen overflow-hidden bg-white text-[#1F2937]">
      <section className="relative min-h-screen overflow-hidden pt-20">
        <motion.div style={{ y: heroImageY }} className="absolute -inset-x-8 -inset-y-16">
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${index === currentHeroIndex ? "opacity-100" : "opacity-0"}`}>
              <Image src={slide.imageUrl} alt={slide.title} fill priority={index === 0} className="object-cover object-center" />
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,59,99,.95)_0%,rgba(15,59,99,.76)_44%,rgba(15,59,99,.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_56%_24%,rgba(212,162,76,.24),transparent_31%),radial-gradient(circle_at_88%_62%,rgba(29,90,140,.22),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-[linear-gradient(0deg,#ffffff_0%,rgba(255,255,255,.72)_36%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-0 opacity-[0.065] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />
        <motion.div style={{ y: heroVisualY }} className="absolute -right-24 top-14 hidden h-[92vh] w-[44vw] skew-x-[-16deg] bg-[#D4A24C]/18 backdrop-blur-[1px] lg:block" />
        <motion.div style={{ y: heroCopyY }} className="absolute right-[18vw] top-0 hidden h-[62vh] w-24 skew-x-[-16deg] bg-[#1D5A8C]/40 lg:block" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.72fr)] xl:grid-cols-[minmax(0,0.98fr)_minmax(420px,0.76fr)]">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ y: heroCopyY }} className="relative z-20 max-w-3xl min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={currentHeroSlide.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.75, ease: "easeOut" }}>
                <div className="mb-6 inline-flex items-center gap-3 rounded-lg border border-[#D4A24C]/50 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B] shadow-[0_16px_40px_rgba(0,0,0,.18)] backdrop-blur-md">
                  <Sparkles size={16} />
                  {currentHeroSlide.dataLabel}
                </div>
                <h1 className="max-w-full font-serif text-[clamp(3.05rem,15.5vw,7.4rem)] font-black leading-[0.86] text-white drop-shadow-[0_14px_38px_rgba(0,0,0,.45)] sm:text-[clamp(4.3rem,8vw,7.4rem)]">
                  {currentHeroSlide.title}
                </h1>
                <p className="mt-6 max-w-3xl text-2xl font-semibold leading-tight text-[#F8D77B] sm:text-4xl">
                  {currentHeroSlide.subtitle}
                </p>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
                  {currentHeroSlide.description}
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  {currentHeroSlide.buttonText && currentHeroSlide.buttonUrl ? (
                    <a href={currentHeroSlide.buttonUrl} target={currentHeroSlide.openInNewTab ? "_blank" : undefined} rel={currentHeroSlide.openInNewTab ? "noreferrer" : undefined} className="group inline-flex items-center justify-center gap-3 rounded-lg bg-[#D4A24C] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_38px_rgba(212,162,76,.28)] transition hover:-translate-y-1 hover:bg-[#B8872D]">
                      {currentHeroSlide.buttonText}
                      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                    </a>
                  ) : null}
                  <a href={portalConfig.eventsPortalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-white/28 bg-[#0F3B63]/72 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] !text-white backdrop-blur transition hover:-translate-y-1 hover:border-[#D4A24C] hover:bg-[#4A86B8] hover:!text-white">
                    {portalHomeContent.heroSecondaryLabel}
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-7 flex max-w-full items-center gap-3 rounded-xl border border-white/20 bg-white/12 p-4 shadow-[0_18px_44px_rgba(0,0,0,.18)] backdrop-blur-xl sm:max-w-xl sm:gap-4"
            >
              <Image src="/assets/selo-125-ago.png" alt="Selo da 125ª AGO" width={82} height={82} className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(244,207,106,.28)] sm:h-20 sm:w-20" />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F8D77B]">{portalHomeContent.agoBadge}</p>
                <p className="mt-1 font-serif text-xl font-black leading-tight text-white sm:text-2xl">{portalHomeContent.agoTitle}</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.85 }} style={{ y: heroVisualY }} className="relative z-10 hidden min-h-[640px] lg:block">
            <motion.div
              animate={{ x: [0, 16, 0], opacity: [0.26, 0.42, 0.26] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 top-4 h-[600px] w-24 skew-x-[-16deg] bg-[#D4A24C]/26"
            />
            <motion.div
              animate={{ x: [0, -12, 0], opacity: [0.18, 0.32, 0.18] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-32 top-24 h-[470px] w-16 skew-x-[-16deg] bg-[#1D5A8C]/34"
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

      <section className="relative bg-white px-5 sm:px-8" aria-label="Números institucionais">
        <div className="mx-auto -mt-16 grid max-w-7xl overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-white shadow-[0_28px_70px_rgba(15,59,99,.14)] backdrop-blur-xl md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`relative overflow-hidden border-b border-[#0F3B63]/10 p-7 md:border-b-0 md:border-r ${index > 1 ? "hidden md:block" : ""}`}>
              <p className="font-serif text-5xl font-black text-[#0F3B63]">{stat.value}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-[#6B7280]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="a-comieadepa" className="relative bg-[#F4F6F8] px-5 py-28 sm:px-8">
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(135deg,rgba(15,59,99,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <motion.div style={{ y: sedeParallaxY }} className="absolute -right-24 top-10 hidden h-[520px] w-[520px] border border-[#0F3B63]/10 bg-white/42 backdrop-blur-sm lg:block [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]" />
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
              className="absolute left-0 top-6 h-[430px] w-[86%] overflow-hidden rounded-xl border border-white bg-white shadow-[0_34px_80px_rgba(15,59,99,.20)] [clip-path:polygon(0_0,100%_0,88%_100%,0_92%)]"
            >
              <Image src={portalHomeContent.aboutImageUrl} alt="Sede aérea da COMIEADEPA" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.02)_0%,rgba(212,162,76,.18)_56%,rgba(15,59,99,.62)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(255,255,255,.20),transparent_26%)]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-1 top-20 z-20 grid h-[268px] w-[268px] place-items-center rounded-full bg-white/24"
            >
              <div className="absolute inset-8 rounded-full bg-[#D4A24C]/24 blur-2xl" />
              <Image
                src={portalHomeContent.aboutSealUrl}
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
              className="absolute bottom-2 right-6 z-30 w-[58%] min-w-[270px] rounded-xl border border-[#D4A24C]/35 bg-[linear-gradient(135deg,rgba(255,255,255,.98),rgba(244,246,248,.96))] p-7 text-[#1F2937] shadow-[0_24px_64px_rgba(15,59,99,.18)] backdrop-blur"
            >
              <div className="flex items-center justify-between gap-4">
                <Landmark size={30} />
                <span className="h-px flex-1 bg-[#0F3B63]/18" />
                <span className="text-xs font-black uppercase tracking-[0.18em]">Desde</span>
              </div>
              <p className="mt-6 font-serif text-4xl font-black leading-none">{portalHomeContent.aboutDate}</p>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.16em]">{portalHomeContent.aboutCaption}</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 64 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.34 }}
            transition={{ duration: 0.82, ease: "easeOut" }}
          >
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">{portalHomeContent.aboutBadge}</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-[1.02] text-[#0F3B63] sm:text-5xl">
              {portalHomeContent.aboutTitle}
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#6B7280]">
              {portalHomeContent.aboutText}
            </p>
            <div className="mt-9 hidden gap-4 sm:grid sm:grid-cols-3">
              {portalHomeContent.aboutPillars.map((item) => (
                <div key={item} className="rounded-xl border border-[#0F3B63]/10 bg-white p-5 shadow-[0_16px_36px_rgba(15,59,99,.08)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,59,99,.13)]">
                  <ShieldCheck className="text-[#D4A24C]" size={22} />
                  <p className="mt-5 font-serif text-2xl font-bold text-[#0F3B63]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="presidencia" className="relative overflow-hidden bg-[#0F3B63] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(212,162,76,.18),transparent_30%),linear-gradient(90deg,rgba(15,59,99,.22),transparent_45%,rgba(74,134,184,.16))]" />
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
            <div className="absolute -left-6 -top-7 z-20 grid h-16 w-16 place-items-center rounded-xl bg-[#D4A24C] text-white shadow-[0_16px_36px_rgba(212,162,76,.30)]">
              <Quote size={32} strokeWidth={3} />
            </div>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#082A49] shadow-[16px_16px_0_rgba(212,162,76,.22),0_28px_80px_rgba(0,0,0,.22)]">
              <div className="relative min-h-[520px]">
                <Image
                  src={portalHomeContent.presidencyImageUrl}
                  alt={portalHomeContent.presidencyName}
                  fill
                  className="object-contain object-bottom"
                />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(17,16,15,.96),rgba(17,16,15,0))]" />
                <div className="absolute bottom-8 left-7">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#F8D77B]">Presidente</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{portalHomeContent.presidencyName}</h3>
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
            <span className="inline-flex rounded-full bg-[#D4A24C]/18 px-5 py-2 text-sm font-black uppercase tracking-[0.08em] text-[#F8D77B]">
              {portalHomeContent.presidencyBadge}
            </span>
            <h2 className="mt-8 text-5xl font-black leading-[0.98] text-white sm:text-6xl">
              {portalHomeContent.presidencyTitleLine1} <br />
              <span className="text-[#F8D77B]">{portalHomeContent.presidencyTitleHighlight}</span> {portalHomeContent.presidencyTitleLine2}
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-white/84">
              {portalHomeContent.presidencyParagraphs.map((paragraph, index) => (
                <p key={paragraph} className={index === portalHomeContent.presidencyParagraphs.length - 1 ? "font-semibold text-white" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="my-9 h-px w-full bg-white/12" />
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#D4A24C] text-xl font-black text-white">
                {portalHomeContent.presidencyInitials}
              </div>
              <div>
                <p className="font-black text-white">{portalHomeContent.presidencyName}</p>
                <p className="text-white/62">{portalHomeContent.presidencyRole}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="eventos" className="relative overflow-hidden bg-white px-5 py-28 sm:px-8">
        <motion.div style={{ y: newsParallaxY }} className="absolute -right-40 top-0 h-[560px] w-[560px] opacity-20 [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]">
          <Image src="/assets/congresso-comieadepa.jpg" alt="" fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(212,162,76,.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">{portalHomeContent.eventsBadge}</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] text-[#0F3B63] sm:text-5xl">{portalHomeContent.eventsTitle}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#6B7280]">
              {portalHomeContent.eventsText}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {eventsLoading &&
              [0, 1].map((item) => (
                <article
                  key={item}
                  className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-xl bg-[#F4F6F8] text-[#1F2937] shadow-[0_18px_38px_rgba(15,59,99,.10)]"
                >
                  <div className="relative h-48 overflow-hidden bg-[#0F3B63]">
                    <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#d8e2ec_0%,#f4f6f8_45%,#d8e2ec_90%)] opacity-90" />
                    <span className="absolute right-4 top-4 h-7 w-32 rounded-md bg-[#00b67a]/30" />
                    <div className="absolute bottom-5 left-5 h-[70px] w-20 rounded-lg bg-white/82 shadow-[0_10px_26px_rgba(0,0,0,.18)]" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="h-7 w-4/5 rounded bg-[#0F3B63]/12" />
                    <div className="mt-3 h-7 w-2/3 rounded bg-[#0F3B63]/12" />
                    <div className="mt-5 h-4 w-28 rounded bg-[#0F3B63]/10" />
                    <div className="mt-8 grid gap-4">
                      <div className="h-4 w-3/5 rounded bg-[#0F3B63]/10" />
                      <div className="h-4 w-4/5 rounded bg-[#0F3B63]/10" />
                      <div className="h-4 w-2/3 rounded bg-[#0F3B63]/10" />
                    </div>
                    <div className="mt-auto h-12 w-full rounded-full bg-[#0F3B63]/18" />
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
                className="group flex h-full min-h-[560px] flex-col overflow-hidden rounded-xl bg-white text-[#1F2937] shadow-[0_18px_38px_rgba(15,59,99,.12)] ring-1 ring-[#0F3B63]/8 transition hover:-translate-y-2 hover:shadow-[0_26px_54px_rgba(15,59,99,.18)]"
              >
                <div className="relative h-48 overflow-hidden bg-[#0F3B63]">
                  <Image src={event.image} alt={event.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,15,10,.28),rgba(18,15,10,.02))]" />
                  <span className={`absolute right-4 top-4 rounded-md px-3 py-1 text-xs font-black text-white ${event.status === "Em Breve" ? "bg-[#D4A24C]" : "bg-[#0F3B63]"}`}>
                    {event.status}
                  </span>
                  <div className="absolute bottom-5 left-5 rounded-lg bg-white px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,.18)]">
                    <p className="text-sm font-semibold text-[#B8872D]">{event.day}</p>
                    <p className="text-xl font-black">{event.month}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className={`text-xl font-black uppercase leading-tight ${event.title === "Treinamento EBD" ? "text-[#B8872D]" : "text-[#1F2937]"}`}>
                    {event.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#6B7280]">{event.category}</p>

                  <div className="mt-5 grid gap-3 text-sm text-[#374151]">
                    <span className="inline-flex items-center gap-3">
                      <Clock size={16} className="text-[#D4A24C]" />
                      {event.time}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <MapPin size={16} className="text-[#D4A24C]" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <Users size={16} className="text-[#D4A24C]" />
                      {event.attendees}
                    </span>
                  </div>

                  <a
                    href={portalConfig.eventsPortalUrl || event.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${event.actionLabel} - ${event.title}`}
                    className={`mt-auto inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-black transition ${
                      event.status === "Em Breve"
                        ? "border border-[#D4A24C]/45 bg-[#F4F6F8] !text-[#0F3B63] hover:bg-[#D4A24C] hover:!text-white"
                        : "bg-[#0F3B63] !text-white hover:bg-[#4A86B8]"
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

      <section id="noticias" className="relative overflow-hidden bg-[#0F3B63] px-5 py-24 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(212,162,76,.18),transparent_35%),radial-gradient(circle_at_86%_12%,rgba(74,134,184,.16),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(135deg,rgba(248,215,123,.18)_1px,transparent_1px)] [background-size:44px_44px]" />
        <motion.div style={{ y: newsParallaxY }} className="absolute right-0 top-0 h-[420px] w-[520px] opacity-12">
          <Image src="/assets/congresso-comieadepa.jpg" alt="" fill className="object-cover" />
        </motion.div>
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F8D77B]">{portalHomeContent.newsBadge}</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] text-white sm:text-5xl">{portalHomeContent.newsTitle}</h2>
            </div>
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:text-[#F8D77B]"
            >
              Todas as Notícias
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {portalNews.map((post, index) => (
              <motion.div
                key={`${post.title}-${post.url}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-white shadow-[0_18px_40px_rgba(15,59,99,.10)] transition hover:-translate-y-2 hover:border-[#D4A24C]/50 hover:shadow-[0_26px_60px_rgba(15,59,99,.18)]"
              >
                <Link href={post.url} className="flex h-full flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0F3B63]/10">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,59,99,.05),rgba(15,59,99,.45))] opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <h3 className="font-serif text-2xl font-bold leading-tight text-[#0F3B63] transition group-hover:text-[#1D5A8C]">
                      {post.title}
                    </h3>
                    <div className="mt-4 text-sm font-semibold text-[#6B7280]">
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span className="uppercase tracking-[0.12em] text-[#B8872D]">{post.category}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-3 rounded-lg border border-[#F8D77B]/45 bg-[#F8D77B] px-7 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63] shadow-[0_16px_34px_rgba(3,12,23,.28)] transition hover:-translate-y-1 hover:border-white/60 hover:bg-white"
            >
              Todas as Notícias
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F4F6F8] px-5 py-24 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,162,76,.18),transparent_28%),radial-gradient(circle_at_86%_78%,rgba(29,90,140,.16),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.20] [background-image:linear-gradient(135deg,rgba(15,59,99,.12)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">{portalHomeContent.videosBadge}</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-[1.03] text-[#0F3B63] sm:text-5xl">{portalHomeContent.videosTitle}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#6B7280]">
              {portalHomeContent.videosText}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {portalVideos.map((video, index) => (
              <article
                key={video.id}
                className={`group relative overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-white p-3 shadow-[0_22px_60px_rgba(15,59,99,.12)] backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#D4A24C]/45 hover:shadow-[0_28px_70px_rgba(15,59,99,.18)] ${index > 0 ? "hidden sm:block" : ""}`}
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
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8872D]">{video.label}</p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-[#0F3B63]">{video.title}</h3>
                  </div>
                  <span className="font-serif text-3xl font-black text-[#0F3B63]/12">0{index + 1}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/videos"
              className="inline-flex items-center gap-3 rounded-lg border border-[#D4A24C]/45 bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#0F3B63] shadow-[0_14px_34px_rgba(15,59,99,.10)] transition hover:-translate-y-1 hover:bg-[#0F3B63] hover:text-white"
            >
              {portalHomeContent.videosButtonLabel} <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      <section id="departamentos" className="relative overflow-hidden bg-white px-5 py-24 text-[#1F2937] sm:px-8">
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(135deg,rgba(15,59,99,.14)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute -right-24 top-0 h-full w-72 skew-x-[-16deg] bg-[#D4A24C]/24" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#B8872D]">{portalHomeContent.departmentsBadge}</p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-[1.03] text-[#0F3B63] sm:text-5xl">{portalHomeContent.departmentsTitle}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#6B7280]">
              {portalHomeContent.departmentsText}
            </p>
          </div>
          <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {portalDepartments.map((department, index) => (
              <motion.a
                key={department.title}
                href={`/departamentos/${department.slug}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group relative min-h-[360px] w-[82vw] shrink-0 snap-start overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-6 shadow-[0_18px_50px_rgba(15,59,99,.10)] backdrop-blur transition hover:-translate-y-2 hover:bg-white hover:shadow-[0_26px_64px_rgba(15,59,99,.16)] sm:w-[360px] lg:w-[305px]"
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
                <div className="relative mt-6 border-t border-[#0F3B63]/10 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8872D]">Departamento</p>
                  <h3 className="mt-2 font-serif text-3xl font-black text-[#0F3B63]">{department.title}</h3>
                  <p className="mt-4 leading-7 text-[#6B7280]">{department.text}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0F3B63] px-5 py-24 text-white sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(212,162,76,.18),transparent_28%),linear-gradient(180deg,#0F3B63_0%,#1D5A8C_54%,#0F3B63_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:34px_34px]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#D4A24C]/18 px-5 py-2 text-sm font-black text-[#F8D77B]">
              <Youtube size={16} />
              {portalHomeContent.eventVideosBadge}
            </span>
            <h2 className="mt-6 text-5xl font-black leading-tight text-white sm:text-6xl">{portalHomeContent.eventVideosTitle}</h2>
            <p className="mt-4 text-lg text-white/64">
              {portalHomeContent.eventVideosText}
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
                className="group overflow-hidden rounded-xl bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,.20)] ring-1 ring-white/12 transition hover:-translate-y-2"
              >
                <a href={video.url} target="_blank" rel="noreferrer" className="block">
                  <div className="relative h-72 overflow-hidden bg-black">
                    <Image src={video.image} alt={video.title} fill className="object-cover opacity-72 transition duration-700 group-hover:scale-105 group-hover:opacity-88" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.42),rgba(0,0,0,.08))]" />
                    <span className="absolute bottom-5 right-5 rounded bg-black/80 px-3 py-1 text-xs font-black uppercase text-white">Live</span>
                    <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#D4A24C] text-white shadow-[0_18px_44px_rgba(212,162,76,.32)] transition group-hover:scale-110">
                      <Play size={34} fill="currentColor" />
                    </span>
                  </div>
                  <div className="grid grid-cols-[48px_1fr] gap-5 p-7">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#D4A24C]/22 text-[#F8D77B]">
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
              href={portalConfig.youtubeChannelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#D4A24C] px-8 py-4 text-sm font-black !text-white transition hover:-translate-y-1 hover:bg-[#B8872D]"
            >
              <Youtube size={18} />
              {portalHomeContent.eventVideosButtonLabel}
            </a>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/36">
              <Users size={16} />
              {portalHomeContent.eventVideosSubscribers}
            </p>
          </div>
        </div>
      </section>

      </main>
    </PublicLayout>
  );
}

async function fetchSupabasePublic<TResult>(table: string, query: string) {
  if (!supabaseAnonKey) {
    return [] as TResult[];
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...getReadSchemaHeaders(table),
    },
  });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${table}. Status: ${response.status}.`);
  }

  return (await response.json()) as TResult[];
}

function getReadSchemaHeaders(table: string): Record<string, string> {
  return table.startsWith("cms_") || table.startsWith("v_") ? { "Accept-Profile": supabaseSiteSchema } : {};
}

function buildCmsLookupMap(rows: CmsLookup[]) {
  return new Map(rows.map((row) => [row.id, row.nome?.trim() ?? ""]));
}

function resolveCmsContentLabel(categoryId: string | null, departmentId: string | null, categoryMap: Map<string, string>, departmentMap: Map<string, string>) {
  return categoryMap.get(categoryId ?? "") || departmentMap.get(departmentId ?? "") || "Notícia";
}

function getPublishedPostsPublicFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}

function mapCmsDepartmentToPortalDepartment(department: CmsDepartmentCard): PortalDepartment {
  const fallback = fallbackDepartmentCards.find((item) => item.slug === department.slug);

  return {
    slug: department.slug,
    logo: department.logo_url?.trim() || fallback?.logo || "/assets/logo-comieadepa.png",
    title: department.nome?.trim() || fallback?.title || "COMIEADEPA",
    text: department.resumo?.trim() || department.titulo?.trim() || fallback?.text || "Página institucional editável pelo painel administrativo.",
    accent: fallback?.accent || getDepartmentAccent(department.slug),
  };
}

function mapCmsVideoToPortalVideo(video: CmsVideo, departmentMap: Map<string, string>) {
  const youtubeId = video.youtube_id || getYoutubeVideoId(video.youtube_url ?? "");

  if (!youtubeId) {
    return null;
  }

  const typeLabel = formatVideoType(video.tipo);
  const departmentName = departmentMap.get(video.departamento_id ?? "");

  return {
    id: youtubeId,
    title: video.titulo?.trim() || "Vídeo oficial",
    label: departmentName ? `${typeLabel} · ${departmentName}` : typeLabel,
  };
}

function mapCmsPostToPortalNews(post: CmsPost, categoryMap: Map<string, string>, departmentMap: Map<string, string>) {
  const title = post.titulo?.trim();

  if (!title || !post.slug) {
    return null;
  }

  return {
    title,
    category: resolveCmsContentLabel(post.categoria_id, post.departamento_id, categoryMap, departmentMap),
    date: formatNewsDate(post.publicado_em ?? post.created_at),
    image: post.capa_url?.trim() || "/assets/sede-aerea-comieadepa.jpg",
    url: `/noticias/${post.slug}`,
  };
}

function formatNewsDate(dateValue: string | null) {
  if (!dateValue) {
    return "Sem data";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function mapCmsSettingsToPortalHomeContent(settings: CmsSetting[]): PortalHomeContent {
  const settingMap = new Map(settings.map((setting) => [setting.chave, stringifySettingValue(setting.valor)]));

  return {
    heroBadge: settingMap.get("home_hero_selo") || defaultPortalHomeContent.heroBadge,
    heroTitle: settingMap.get("home_hero_titulo") || defaultPortalHomeContent.heroTitle,
    heroSubtitle: settingMap.get("home_hero_subtitulo") || defaultPortalHomeContent.heroSubtitle,
    heroText: settingMap.get("home_hero_texto") || defaultPortalHomeContent.heroText,
    heroPrimaryLabel: settingMap.get("home_hero_botao_primario") || defaultPortalHomeContent.heroPrimaryLabel,
    heroPrimaryUrl: settingMap.get("home_hero_link_primario") || defaultPortalHomeContent.heroPrimaryUrl,
    heroSecondaryLabel: settingMap.get("home_hero_botao_secundario") || defaultPortalHomeContent.heroSecondaryLabel,
    agoBadge: settingMap.get("home_ago_selo") || defaultPortalHomeContent.agoBadge,
    agoTitle: settingMap.get("home_ago_titulo") || defaultPortalHomeContent.agoTitle,
    aboutBadge: settingMap.get("home_sobre_selo") || defaultPortalHomeContent.aboutBadge,
    aboutTitle: settingMap.get("home_sobre_titulo") || defaultPortalHomeContent.aboutTitle,
    aboutText: settingMap.get("home_sobre_texto") || defaultPortalHomeContent.aboutText,
    aboutImageUrl: settingMap.get("home_sobre_imagem_url") || defaultPortalHomeContent.aboutImageUrl,
    aboutSealUrl: settingMap.get("home_sobre_selo_url") || defaultPortalHomeContent.aboutSealUrl,
    aboutDate: settingMap.get("home_sobre_data") || defaultPortalHomeContent.aboutDate,
    aboutCaption: settingMap.get("home_sobre_legenda") || defaultPortalHomeContent.aboutCaption,
    aboutPillars: [
      settingMap.get("home_sobre_pilar_1") || defaultPortalHomeContent.aboutPillars[0],
      settingMap.get("home_sobre_pilar_2") || defaultPortalHomeContent.aboutPillars[1],
      settingMap.get("home_sobre_pilar_3") || defaultPortalHomeContent.aboutPillars[2],
    ].filter(Boolean),
    presidencyImageUrl: settingMap.get("home_presidencia_imagem_url") || defaultPortalHomeContent.presidencyImageUrl,
    presidencyName: settingMap.get("home_presidencia_nome") || defaultPortalHomeContent.presidencyName,
    presidencyRole: settingMap.get("home_presidencia_cargo") || defaultPortalHomeContent.presidencyRole,
    presidencyInitials: settingMap.get("home_presidencia_iniciais") || defaultPortalHomeContent.presidencyInitials,
    presidencyBadge: settingMap.get("home_presidencia_selo") || defaultPortalHomeContent.presidencyBadge,
    presidencyTitleLine1: settingMap.get("home_presidencia_titulo_linha_1") || defaultPortalHomeContent.presidencyTitleLine1,
    presidencyTitleHighlight: settingMap.get("home_presidencia_titulo_destaque") || defaultPortalHomeContent.presidencyTitleHighlight,
    presidencyTitleLine2: settingMap.get("home_presidencia_titulo_linha_2") || defaultPortalHomeContent.presidencyTitleLine2,
    presidencyParagraphs: [
      settingMap.get("home_presidencia_texto_1") || defaultPortalHomeContent.presidencyParagraphs[0],
      settingMap.get("home_presidencia_texto_2") || defaultPortalHomeContent.presidencyParagraphs[1],
      settingMap.get("home_presidencia_texto_3") || defaultPortalHomeContent.presidencyParagraphs[2],
    ].filter(Boolean),
    eventsBadge: settingMap.get("home_eventos_selo") || defaultPortalHomeContent.eventsBadge,
    eventsTitle: settingMap.get("home_eventos_titulo") || defaultPortalHomeContent.eventsTitle,
    eventsText: settingMap.get("home_eventos_texto") || defaultPortalHomeContent.eventsText,
    newsBadge: settingMap.get("home_noticias_selo") || defaultPortalHomeContent.newsBadge,
    newsTitle: settingMap.get("home_noticias_titulo") || defaultPortalHomeContent.newsTitle,
    videosBadge: settingMap.get("home_videos_selo") || defaultPortalHomeContent.videosBadge,
    videosTitle: settingMap.get("home_videos_titulo") || defaultPortalHomeContent.videosTitle,
    videosText: settingMap.get("home_videos_texto") || defaultPortalHomeContent.videosText,
    videosButtonLabel: settingMap.get("home_videos_botao") || defaultPortalHomeContent.videosButtonLabel,
    departmentsBadge: settingMap.get("home_departamentos_selo") || defaultPortalHomeContent.departmentsBadge,
    departmentsTitle: settingMap.get("home_departamentos_titulo") || defaultPortalHomeContent.departmentsTitle,
    departmentsText: settingMap.get("home_departamentos_texto") || defaultPortalHomeContent.departmentsText,
    eventVideosBadge: settingMap.get("home_eventos_video_selo") || defaultPortalHomeContent.eventVideosBadge,
    eventVideosTitle: settingMap.get("home_eventos_video_titulo") || defaultPortalHomeContent.eventVideosTitle,
    eventVideosText: settingMap.get("home_eventos_video_texto") || defaultPortalHomeContent.eventVideosText,
    eventVideosButtonLabel: settingMap.get("home_eventos_video_botao") || defaultPortalHomeContent.eventVideosButtonLabel,
    eventVideosSubscribers: settingMap.get("home_eventos_video_inscritos") || defaultPortalHomeContent.eventVideosSubscribers,
  };
}

function stringifySettingValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function getYoutubeVideoId(url: string) {
  const patterns = [/youtu\.be\/([^?&/]+)/, /youtube\.com\/watch\?v=([^?&/]+)/, /youtube\.com\/shorts\/([^?&/]+)/, /youtube\.com\/embed\/([^?&/]+)/];
  const match = patterns.map((pattern) => url.match(pattern)?.[1]).find(Boolean);
  return match ?? null;
}

function formatVideoType(value: string | null) {
  const normalized = value?.toLowerCase();

  if (normalized === "shorts") {
    return "Shorts";
  }

  if (normalized === "live") {
    return "Live";
  }

  return "Vídeo";
}

function getDepartmentAccent(slug: string) {
  const accents: Record<string, string> = {
    ago: "#d8a534",
    umadespa: "#f0782b",
    coadespa: "#9d4b8c",
    seiadepa: "#2aa8e8",
    conec: "#c89a2d",
    aemadepa: "#b46b2b",
    qgu: "#425f32",
  };

  return accents[slug] ?? "#0F3B63";
}

function mapSupabaseEventToCard(event: SupabaseEvent): EventCard {
  const normalizedName = normalizeUtf8Text(event.nome);
  const normalizedDepartment = normalizeUtf8Text(event.departamento);
  const normalizedLocal = normalizeUtf8Text(event.local);
  const normalizedCity = normalizeUtf8Text(event.cidade);
  const normalizedStatus = normalizeUtf8Text(event.status);
  const date = parseSupabaseDate(event.data_inicio);
  const department = normalizedDepartment?.trim() || "COMIEADEPA";
  const title = titleCase(normalizedName);
  const status = getEventStatus({ ...event, status: normalizedStatus });

  return {
    title,
    category: department,
    day: date.day,
    month: date.month,
    time: "Consultar no portal",
    location: inferEventLocation({ ...event, local: normalizedLocal, cidade: normalizedCity, departamento: normalizedDepartment }),
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

  const response = await fetch(`${supabaseUrl}/rest/v1/v_evento_tipos_inscricao_publicos?${params.toString()}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Accept-Profile": supabaseSiteSchema,
    },
  });

  if (!response.ok) {
    console.warn(`Não foi possível buscar tipos de inscrição. Status: ${response.status}.`);
    return [];
  }

  const data = (await response.json()) as EventRegistrationType[];
  return data.map((type) => ({
    ...type,
    nome: normalizeUtf8Text(type.nome),
  }));
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

function normalizeUtf8Text(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const text = String(value);
  const hasMojibake = /Ã.|Â|â€|â€™|â€œ|â€�/u.test(text);

  if (!hasMojibake) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    if (decoded && decoded !== text) {
      const secondPass = /Ã.|Â|â€|â€™|â€œ|â€�/u.test(decoded)
        ? new TextDecoder("utf-8", { fatal: false }).decode(Uint8Array.from(decoded, (char) => char.charCodeAt(0)))
        : decoded;

      return secondPass || decoded;
    }
  } catch {
    return text;
  }

  return text;
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

function isEventVisibleOnHome(event: SupabaseEvent) {
  const normalizedStatus = normalizeUtf8Text(event.status).toLocaleLowerCase("pt-BR");

  if (["encerrado", "finalizado", "cancelado", "rascunho"].includes(normalizedStatus)) {
    return false;
  }

  const endDate = getEventEndDate(event);

  if (!endDate) {
    return true;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return endDate >= startOfToday;
}

function getEventSortTimestamp(event: SupabaseEvent) {
  return getEventStartDate(event)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function getEventStartDate(event: SupabaseEvent) {
  return parseEventDate(event.data_inicio, false);
}

function getEventEndDate(event: SupabaseEvent) {
  return parseEventDate(event.data_fim ?? event.data_inicio, true);
}

function parseEventDate(value: string | null, isEndDate: boolean) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return isEndDate
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
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

