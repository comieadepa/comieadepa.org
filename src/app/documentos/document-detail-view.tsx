import { ArrowLeft, Download, FileText, Layers3, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  buildDocumentDownloadPath,
  CmsDocument,
  formatDocumentDate,
  formatDocumentSize,
  formatDownloads,
  inferDocumentType,
} from "@/lib/documentos";

type DocumentDetailViewProps = {
  document: CmsDocument;
  relatedDocuments: CmsDocument[];
};

export function DocumentDetailView({ document, relatedDocuments }: DocumentDetailViewProps) {
  const imageUrl = document.thumbnail_url?.trim() || "/assets/sede-aerea-comieadepa.jpg";
  const fileType = document.tipo_arquivo ?? inferDocumentType(document.arquivo_url);

  return (
    <main className="min-h-screen bg-white text-[#1F2937]">
      <article>
        <header className="relative overflow-hidden px-5 py-16 sm:px-8">
          <div className="absolute inset-0">
            <Image src={imageUrl} alt={document.titulo} fill className="object-cover opacity-20" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/86 via-white/94 to-white" />
          <div className="relative mx-auto max-w-4xl">
            <Link href="/documentos" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63] transition hover:text-[#4A86B8]">
              <ArrowLeft size={18} />
              Documentos
            </Link>

            <div className="mt-10">
              <div className="flex flex-wrap items-center gap-3">
                {document.categoria ? (
                  <span className="inline-flex rounded-md border border-[#D4A24C]/40 bg-white px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                    {document.categoria}
                  </span>
                ) : null}
                {document.destaque ? (
                  <span className="inline-flex items-center gap-2 rounded-md border border-[#D4A24C]/40 bg-[#fff7df] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B8872D]">
                    <Trophy size={14} />
                    Destaque
                  </span>
                ) : null}
              </div>

              <h1 className="mt-6 font-serif text-4xl font-black leading-[1.04] text-[#0F3B63] sm:text-6xl">{document.titulo}</h1>
              {document.descricao ? <p className="mt-6 text-xl leading-8 text-[#6B7280]">{document.descricao}</p> : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetaPill icon={FileText} label="Tipo" value={fileType} />
                <MetaPill icon={Layers3} label="Tamanho" value={formatDocumentSize(document.tamanho)} />
                <MetaPill icon={Download} label="Downloads" value={formatDownloads(document.downloads)} />
                <MetaPill icon={FileText} label="Publicado" value={formatDocumentDate(document.updated_at ?? document.created_at)} />
              </div>

              <a
                href={buildDocumentDownloadPath(document.slug)}
                className="mt-8 inline-flex items-center gap-3 bg-[#0F3B63] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#164c7d]"
              >
                <Download size={18} />
                Baixar documento
              </a>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 pb-14 sm:px-8">
          {document.thumbnail_url ? (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden border border-[#0F3B63]/10 bg-[#F4F6F8] shadow-[0_20px_60px_rgba(15,59,99,.08)]">
              <Image src={document.thumbnail_url} alt={document.titulo} fill className="object-cover" />
            </div>
          ) : null}

          {document.descricao ? (
            <section className="border border-[#0F3B63]/10 bg-[#F8FAFC] p-6 text-lg leading-8 text-[#374151] shadow-[0_18px_50px_rgba(15,59,99,.06)]">
              {document.descricao}
            </section>
          ) : null}
        </div>

        <section className="border-t border-[#0F3B63]/10 bg-[#F8FAFC] px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Relacionados</p>
                <h2 className="mt-3 font-serif text-4xl font-black text-[#0F3B63]">Documentos relacionados</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedDocuments.map((related) => (
                <article key={related.id} className="overflow-hidden border border-[#0F3B63]/10 bg-white shadow-[0_18px_50px_rgba(15,59,99,.08)]">
                  <Link href={`/documentos/${related.slug}`} className="block">
                    <div className="relative aspect-[16/9] bg-[#E5ECF3]">
                      <Image
                        src={related.thumbnail_url?.trim() || "/assets/sede-aerea-comieadepa.jpg"}
                        alt={related.titulo}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      {related.categoria ? (
                        <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B8872D]">{related.categoria}</span>
                      ) : null}
                      <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-[#0F3B63]">{related.titulo}</h3>
                      {related.descricao ? <p className="mt-3 line-clamp-3 leading-7 text-[#6B7280]">{related.descricao}</p> : null}
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {relatedDocuments.length === 0 ? (
              <div className="mt-8 border border-[#0F3B63]/10 bg-white p-6 text-[#6B7280]">Nenhum documento relacionado disponivel.</div>
            ) : null}
          </div>
        </section>
      </article>
    </main>
  );
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-[#0F3B63]/10 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,59,99,.05)]">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-[#B8872D]" />
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#6B7280]">{label}</p>
          <p className="mt-1 text-sm font-bold text-[#0F3B63]">{value}</p>
        </div>
      </div>
    </div>
  );
}
