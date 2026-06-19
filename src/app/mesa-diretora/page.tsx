import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo";
import { MesaDiretoraClient, BoardGroup, BoardMember } from "./mesa-diretora-client";
import { listarGruposAtivos, listarMembrosPublicados } from "@/lib/mesa-diretora";

const fallbackGroups: BoardGroup[] = [
  { id: "presidente", nome: "Presidente", layout: "hero" },
  { id: "presidente_honra", nome: "Presidente de Honra", layout: "center" },
  { id: "vice_presidentes", nome: "Vice-Presidentes", layout: "grid3" },
  { id: "secretarios", nome: "Secretários", layout: "grid4" },
  { id: "tesoureiros", nome: "Tesoureiros", layout: "grid4" },
  { id: "assessoria", nome: "Secretário Executivo / Assessoria", layout: "center" },
];

const fallbackMembers: BoardMember[] = [
  {
    nome: "Pr. Océlio Nauar",
    cargo: "Presidente",
    grupo: "presidente",
    campo: "Belém - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 1,
  },
  {
    nome: "Pr. Firmino Gouveia",
    cargo: "Presidente de Honra",
    grupo: "presidente_honra",
    campo: "Belém - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 1,
  },
  {
    nome: "Pr. José Almeida",
    cargo: "1º Vice-Presidente",
    grupo: "vice_presidentes",
    campo: "Ananindeua - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 1,
  },
  {
    nome: "Pr. Samuel Ferreira",
    cargo: "2º Vice-Presidente",
    grupo: "vice_presidentes",
    campo: "Castanhal - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 2,
  },
  {
    nome: "Pr. Marcos Ribeiro",
    cargo: "1º Secretário",
    grupo: "secretarios",
    campo: "Marabá - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 1,
  },
  {
    nome: "Pr. Daniel Sousa",
    cargo: "2º Secretário",
    grupo: "secretarios",
    campo: "Santarém - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 2,
  },
  {
    nome: "Pr. Eliabe Costa",
    cargo: "1º Tesoureiro",
    grupo: "tesoureiros",
    campo: "Parauapebas - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 1,
  },
  {
    nome: "Pr. João Batista",
    cargo: "2º Tesoureiro",
    grupo: "tesoureiros",
    campo: "Altamira - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 2,
  },
  {
    nome: "Pr. Sóstenes Apolos",
    cargo: "Secretário Executivo",
    grupo: "assessoria",
    campo: "Belém - PA",
    foto: "/assets/presidente-comieadepa.png",
    ordem: 1,
  },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Mesa Diretora | COMIEADEPA",
  description: "Conheça a Mesa Diretora da COMIEADEPA.",
  path: "/mesa-diretora",
  image: "/assets/logo-comieadepa.png",
});

export default async function MesaDiretoraPage() {
  let boardMembers: BoardMember[] = [];
  let groups: BoardGroup[] = [];

  try {
    const activeGroups = await listarGruposAtivos();
    const publishedMembers = await listarMembrosPublicados();

    if (activeGroups && activeGroups.length > 0) {
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

      // Determinar a foto do presidente publicado como fallback principal
      const presidentMember = publishedMembers.find(
        (m) => (m.grupo_id === groups[0].id || m.grupo === "presidente") && m.foto_url
      );
      const presidentFallbackPhoto = presidentMember?.foto_url || "/assets/presidente-comieadepa.png";

      boardMembers = publishedMembers.map((member) => ({
        nome: member.nome,
        cargo: member.cargo,
        grupo_id: member.grupo_id,
        grupo: member.grupo, // compatibilidade legada
        campo: member.campo ?? undefined,
        foto: member.foto_url || presidentFallbackPhoto,
        ordem: member.ordem,
      }));
    } else {
      groups = fallbackGroups;
      boardMembers = fallbackMembers;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da mesa diretora:", error);
    groups = fallbackGroups;
    boardMembers = fallbackMembers;
  }

  return <MesaDiretoraClient groups={groups} boardMembers={boardMembers} />;
}
