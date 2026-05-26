export type DepartmentPageContent = {
  slug: string;
  nome: string;
  titulo: string;
  resumo: string;
  conteudo: string;
};

export const fallbackDepartments: DepartmentPageContent[] = [
  {
    slug: "ago",
    nome: "AGO",
    titulo: "Assembleia Geral Ordinária",
    resumo: "A maior reunião deliberativa da COMIEADEPA, reunindo ministros, liderança e campos eclesiásticos.",
    conteudo:
      "A AGO concentra decisões, comunhão, prestação de contas, programação convencional e orientações que fortalecem a unidade da obra em todo o Pará.",
  },
  {
    slug: "umadespa",
    nome: "UMADESPA",
    titulo: "Juventude em missão",
    resumo: "Mobilização da juventude assembleiana para evangelismo, serviço cristão e compromisso com a Palavra.",
    conteudo:
      "A UMADESPA atua na formação espiritual da juventude, promovendo congressos, encontros regionais e ações que conectam novas gerações à missão da convenção.",
  },
  {
    slug: "coadespa",
    nome: "COADESPA",
    titulo: "Comunhão, cuidado e serviço",
    resumo: "Coordenação de senhoras com atuação na edificação da igreja e apoio às ações convencionais.",
    conteudo:
      "A COADESPA fortalece a participação das mulheres na obra, com iniciativas de comunhão, oração, ensino e cooperação nos eventos e projetos da convenção.",
  },
  {
    slug: "seiadepa",
    nome: "SEIADEPA",
    titulo: "Ensino infantil e formação cristã",
    resumo: "Departamento infantil dedicado ao ensino bíblico, cuidado e formação cristã para crianças.",
    conteudo:
      "A SEIADEPA apoia igrejas e educadores com ações, treinamentos e conteúdos voltados ao desenvolvimento espiritual das crianças no ambiente cristão.",
  },
  {
    slug: "conec",
    nome: "CONEC",
    titulo: "Conselho de Educação Cristã",
    resumo: "Formação, currículo, educação bíblica e fortalecimento do ensino cristão no campo convencional.",
    conteudo:
      "O CONEC contribui para a organização pedagógica e doutrinária da educação cristã, apoiando líderes, professores e departamentos locais.",
  },
  {
    slug: "aemadepa",
    nome: "AEMADEPA",
    titulo: "Associação de esposas de ministros",
    resumo: "Comunhão, cuidado e apoio às famílias ministeriais vinculadas à convenção.",
    conteudo:
      "A AEMADEPA fortalece a comunhão entre esposas de ministros, promovendo cuidado, cooperação, edificação espiritual e apoio às ações convencionais.",
  },
  {
    slug: "qgu",
    nome: "QGU",
    titulo: "Quartel General UMADESPA",
    resumo: "Mobilização da juventude para serviço cristão, unidade e compromisso com a missão.",
    conteudo:
      "O QGU apoia a juventude da UMADESPA em ações de mobilização, serviço, evangelismo e fortalecimento da identidade cristã nos campos eclesiásticos.",
  },
];

export function findFallbackDepartment(slug: string) {
  return fallbackDepartments.find((department) => department.slug === slug);
}
