import { CmsMesaGrupo, CmsMesaDiretora } from "@/lib/mesa-diretora";

export type FixedRoleSection = {
  id: string;
  title: string;
  groupSlug: string;
  subtitle: string;
  roles: FixedRoleDefinition[];
};

export type FixedRoleDefinition = {
  key: string;
  cargo: string;
  groupSlug: string;
  ordem: number;
  subgrupo?: "titular" | "suplente";
  defaultDestaque?: boolean;
};

export const FIXED_ROLES_SECTIONS: FixedRoleSection[] = [
  {
    id: "presidente",
    title: "Presidente",
    groupSlug: "presidente",
    subtitle: "Liderança Executiva e Representação Geral",
    roles: [
      {
        key: "presidente_1",
        cargo: "Presidente",
        groupSlug: "presidente",
        ordem: 1,
        defaultDestaque: true,
      },
    ],
  },
  {
    id: "vices_administrativos",
    title: "Vices-Administrativos",
    groupSlug: "vices_administrativos",
    subtitle: "1º ao 6º Vice-Administrativo",
    roles: [
      { key: "vice_adm_1", cargo: "1º Vice-Administrativo", groupSlug: "vices_administrativos", ordem: 1 },
      { key: "vice_adm_2", cargo: "2º Vice-Administrativo", groupSlug: "vices_administrativos", ordem: 2 },
      { key: "vice_adm_3", cargo: "3º Vice-Administrativo", groupSlug: "vices_administrativos", ordem: 3 },
      { key: "vice_adm_4", cargo: "4º Vice-Administrativo", groupSlug: "vices_administrativos", ordem: 4 },
      { key: "vice_adm_5", cargo: "5º Vice-Administrativo", groupSlug: "vices_administrativos", ordem: 5 },
      { key: "vice_adm_6", cargo: "6º Vice-Administrativo", groupSlug: "vices_administrativos", ordem: 6 },
    ],
  },
  {
    id: "vices_assistenciais",
    title: "Vices-Assistenciais",
    groupSlug: "vices_assistenciais",
    subtitle: "1º ao 6º Vice-Assistencial",
    roles: [
      { key: "vice_ass_1", cargo: "1º Vice-Assistencial", groupSlug: "vices_assistenciais", ordem: 1 },
      { key: "vice_ass_2", cargo: "2º Vice-Assistencial", groupSlug: "vices_assistenciais", ordem: 2 },
      { key: "vice_ass_3", cargo: "3º Vice-Assistencial", groupSlug: "vices_assistenciais", ordem: 3 },
      { key: "vice_ass_4", cargo: "4º Vice-Assistencial", groupSlug: "vices_assistenciais", ordem: 4 },
      { key: "vice_ass_5", cargo: "5º Vice-Assistencial", groupSlug: "vices_assistenciais", ordem: 5 },
      { key: "vice_ass_6", cargo: "6º Vice-Assistencial", groupSlug: "vices_assistenciais", ordem: 6 },
    ],
  },
  {
    id: "secretarios",
    title: "Secretários",
    groupSlug: "secretarios",
    subtitle: "1º ao 5º Secretário",
    roles: [
      { key: "sec_1", cargo: "1º Secretário", groupSlug: "secretarios", ordem: 1 },
      { key: "sec_2", cargo: "2º Secretário", groupSlug: "secretarios", ordem: 2 },
      { key: "sec_3", cargo: "3º Secretário", groupSlug: "secretarios", ordem: 3 },
      { key: "sec_4", cargo: "4º Secretário", groupSlug: "secretarios", ordem: 4 },
      { key: "sec_5", cargo: "5º Secretário", groupSlug: "secretarios", ordem: 5 },
    ],
  },
  {
    id: "tesoureiros",
    title: "Tesoureiros",
    groupSlug: "tesoureiros",
    subtitle: "1º ao 3º Tesoureiro",
    roles: [
      { key: "tes_1", cargo: "1º Tesoureiro", groupSlug: "tesoureiros", ordem: 1 },
      { key: "tes_2", cargo: "2º Tesoureiro", groupSlug: "tesoureiros", ordem: 2 },
      { key: "tes_3", cargo: "3º Tesoureiro", groupSlug: "tesoureiros", ordem: 3 },
    ],
  },
  {
    id: "conselho_fiscal",
    title: "Conselho Fiscal",
    groupSlug: "conselho_fiscal",
    subtitle: "Titulares (3) e Suplentes (3)",
    roles: [
      { key: "cf_tit_1", cargo: "Representante e 1º Titular", groupSlug: "conselho_fiscal", ordem: 1, subgrupo: "titular" },
      { key: "cf_tit_2", cargo: "2º Titular", groupSlug: "conselho_fiscal", ordem: 2, subgrupo: "titular" },
      { key: "cf_tit_3", cargo: "3º Titular", groupSlug: "conselho_fiscal", ordem: 3, subgrupo: "titular" },
      { key: "cf_sup_1", cargo: "1º Suplente", groupSlug: "conselho_fiscal", ordem: 4, subgrupo: "suplente" },
      { key: "cf_sup_2", cargo: "2º Suplente", groupSlug: "conselho_fiscal", ordem: 5, subgrupo: "suplente" },
      { key: "cf_sup_3", cargo: "3º Suplente", groupSlug: "conselho_fiscal", ordem: 6, subgrupo: "suplente" },
    ],
  },
];

/**
 * Mapeia e localiza o membro ocupante para um cargo fixo,
 * conferindo por cargo ou por grupo_id / slug + ordem + subgrupo.
 */
export function findOccupantForRole(
  roleDef: FixedRoleDefinition,
  members: CmsMesaDiretora[],
  groups: CmsMesaGrupo[]
): CmsMesaDiretora | null {
  const targetGroup = groups.find((g) => g.slug === roleDef.groupSlug);

  // 1. Tentar encontrar por match exato de cargo
  const exactByCargo = members.find(
    (m) => m.cargo.trim().toLowerCase() === roleDef.cargo.trim().toLowerCase()
  );
  if (exactByCargo) return exactByCargo;

  // 2. Tentar por grupo + ordem + subgrupo
  const matchByGroupAndOrder = members.find((m) => {
    const isSameGroup =
      (targetGroup && m.grupo_id === targetGroup.id) ||
      m.grupo === roleDef.groupSlug;
    if (!isSameGroup) return false;

    if (roleDef.subgrupo) {
      return m.subgrupo === roleDef.subgrupo && m.ordem === roleDef.ordem;
    }
    return m.ordem === roleDef.ordem;
  });

  return matchByGroupAndOrder ?? null;
}
