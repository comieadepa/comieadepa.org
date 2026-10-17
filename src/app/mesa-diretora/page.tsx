import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo";
import { MesaDiretoraClient, BoardGroup, BoardMember } from "./mesa-diretora-client";
import { listarGruposAtivos, listarMembrosPublicados } from "@/lib/mesa-diretora";

// ──────────────────────────────────────────────────────────────────────────────
// DADOS DE DEMONSTRAÇÃO (usados somente enquanto o banco estiver vazio)
// Claramente identificados: isDemoData=true dispara aviso visual na página.
// Substituídos automaticamente assim que a migration for aplicada e dirigentes
// forem cadastrados e publicados no painel administrativo.
// ──────────────────────────────────────────────────────────────────────────────

const DEMO_GROUPS: BoardGroup[] = [
  { id: "presidente",         nome: "Presidente",          slug: "presidente",         subtitulo: "Ministro do Evangelho",     layout: "hero"           },
  { id: "vices_admin",        nome: "Vices-Administrativos", slug: "vices_administrativos", subtitulo: "1º ao 6º Vice-Administrativo", layout: "grid6"  },
  { id: "vices_assist",       nome: "Vices-Assistenciais", slug: "vices_assistenciais", subtitulo: "1º ao 6º Vice-Assistencial", layout: "grid6"          },
  { id: "secretarios",        nome: "Secretários",         slug: "secretarios",        subtitulo: "1º ao 5º Secretário",       layout: "grid5"           },
  { id: "tesoureiros",        nome: "Tesoureiros",         slug: "tesoureiros",        subtitulo: "1º ao 3º Tesoureiro",       layout: "grid3"           },
  { id: "conselho_fiscal",    nome: "Conselho Fiscal",     slug: "conselho_fiscal",    subtitulo: "Titulares e Suplentes",     layout: "conselho_fiscal" },
];

function makeDemoMember(
  nome: string,
  cargo: string,
  grupo: string,
  ordem: number,
  subgrupo?: "titular" | "suplente"
): BoardMember {
  return { nome, cargo, grupo, ordem, foto: "", subgrupo: subgrupo ?? null };
}

const DEMO_MEMBERS: BoardMember[] = [
  // Presidente
  makeDemoMember("Pr. [Nome do Presidente]",         "Presidente",          "presidente",           1),

  // 6 Vices-Administrativos
  makeDemoMember("Pr. [1º Vice-Adm.]",               "1º Vice-Administrativo", "vices_administrativos", 1),
  makeDemoMember("Pr. [2º Vice-Adm.]",               "2º Vice-Administrativo", "vices_administrativos", 2),
  makeDemoMember("Pr. [3º Vice-Adm.]",               "3º Vice-Administrativo", "vices_administrativos", 3),
  makeDemoMember("Pr. [4º Vice-Adm.]",               "4º Vice-Administrativo", "vices_administrativos", 4),
  makeDemoMember("Pr. [5º Vice-Adm.]",               "5º Vice-Administrativo", "vices_administrativos", 5),
  makeDemoMember("Pr. [6º Vice-Adm.]",               "6º Vice-Administrativo", "vices_administrativos", 6),

  // 6 Vices-Assistenciais
  makeDemoMember("Pr. [1º Vice-Ass.]",               "1º Vice-Assistencial",   "vices_assistenciais",   1),
  makeDemoMember("Pr. [2º Vice-Ass.]",               "2º Vice-Assistencial",   "vices_assistenciais",   2),
  makeDemoMember("Pr. [3º Vice-Ass.]",               "3º Vice-Assistencial",   "vices_assistenciais",   3),
  makeDemoMember("Pr. [4º Vice-Ass.]",               "4º Vice-Assistencial",   "vices_assistenciais",   4),
  makeDemoMember("Pr. [5º Vice-Ass.]",               "5º Vice-Assistencial",   "vices_assistenciais",   5),
  makeDemoMember("Pr. [6º Vice-Ass.]",               "6º Vice-Assistencial",   "vices_assistenciais",   6),

  // 5 Secretários
  makeDemoMember("Pr. [1º Secretário]",              "1º Secretário",          "secretarios",           1),
  makeDemoMember("Pr. [2º Secretário]",              "2º Secretário",          "secretarios",           2),
  makeDemoMember("Pr. [3º Secretário]",              "3º Secretário",          "secretarios",           3),
  makeDemoMember("Pr. [4º Secretário]",              "4º Secretário",          "secretarios",           4),
  makeDemoMember("Pr. [5º Secretário]",              "5º Secretário",          "secretarios",           5),

  // 3 Tesoureiros
  makeDemoMember("Pr. [1º Tesoureiro]",              "1º Tesoureiro",          "tesoureiros",           1),
  makeDemoMember("Pr. [2º Tesoureiro]",              "2º Tesoureiro",          "tesoureiros",           2),
  makeDemoMember("Pr. [3º Tesoureiro]",              "3º Tesoureiro",          "tesoureiros",           3),

  // Conselho Fiscal — 3 Titulares
  makeDemoMember("Pr. [1º Titular]",                 "Representante e 1º Titular", "conselho_fiscal",   1, "titular"),
  makeDemoMember("Pr. [2º Titular]",                 "2º Titular",             "conselho_fiscal",       2, "titular"),
  makeDemoMember("Pr. [3º Titular]",                 "3º Titular",             "conselho_fiscal",       3, "titular"),

  // Conselho Fiscal — 3 Suplentes
  makeDemoMember("Pr. [1º Suplente]",                "1º Suplente",            "conselho_fiscal",       4, "suplente"),
  makeDemoMember("Pr. [2º Suplente]",                "2º Suplente",            "conselho_fiscal",       5, "suplente"),
  makeDemoMember("Pr. [3º Suplente]",                "3º Suplente",            "conselho_fiscal",       6, "suplente"),
];

// ──────────────────────────────────────────────────────────────────────────────
// METADATA SEO
// ──────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = buildSeoMetadata({
  title: "Mesa Diretora | COMIEADEPA",
  description:
    "Conheça a Mesa Diretora da COMIEADEPA — Presidente, Vices-Administrativos, Vices-Assistenciais, Secretários, Tesoureiros e Conselho Fiscal da Convenção Interestadual de Ministros e Igrejas Evangélicas Assembleias de Deus no Pará.",
  path: "/mesa-diretora",
  image: "/assets/sede-aerea-comieadepa.jpg",
});

// ──────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default async function MesaDiretoraPage() {
  let boardMembers: BoardMember[] = [];
  let groups: BoardGroup[] = [];
  let isDemoData = false;

  try {
    const [activeGroups, publishedMembers] = await Promise.all([
      listarGruposAtivos(),
      listarMembrosPublicados(),
    ]);

    const hasRealData = activeGroups.length > 0 && publishedMembers.length > 0;

    if (hasRealData) {
      groups = activeGroups.map((g) => ({
        id: g.id,
        nome: g.nome,
        slug: g.slug,
        subtitulo: g.subtitulo,
        descricao: g.descricao,
        bg_image_url: g.bg_image_url,
        title_color: g.title_color,
        layout: g.layout,
      }));

      boardMembers = publishedMembers.map((member) => ({
        nome: member.nome,
        cargo: member.cargo,
        grupo_id: member.grupo_id,
        grupo: member.grupo,
        subgrupo: member.subgrupo ?? null,
        campo: member.campo ?? undefined,
        foto: member.foto_url ?? "",
        ordem: member.ordem,
      }));
    } else {
      // Grupos existem mas sem membros publicados, ou banco sem migration:
      // usar dados de demonstração para permitir prévia visual.
      groups = DEMO_GROUPS;
      boardMembers = DEMO_MEMBERS;
      isDemoData = true;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da mesa diretora:", error);
    groups = DEMO_GROUPS;
    boardMembers = DEMO_MEMBERS;
    isDemoData = true;
  }

  return (
    <MesaDiretoraClient
      groups={groups}
      boardMembers={boardMembers}
      isDemoData={isDemoData}
    />
  );
}
