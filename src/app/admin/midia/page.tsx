import { selectSupabaseRows } from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { Copy, ExternalLink, FileImage, ImagePlus, UploadCloud } from "lucide-react";
import Image from "next/image";
import { StatusMessage } from "../status-message";
import { CopyUrlButton } from "./copy-url-button";
import { headers } from "next/headers";

type MediaAsset = {
  id: string;
  titulo: string | null;
  arquivo_url: string;
  tipo: string | null;
  pasta: string | null;
  created_at: string;
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; pasta?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canUpload = canPerformAdminAction(role, "midia", "upload");
  const selectedFolder = params?.pasta && params.pasta !== "todos" ? params.pasta : null;
  const mediaQuery = selectedFolder
    ? `select=id,titulo,arquivo_url,tipo,pasta,created_at&pasta=eq.${encodeURIComponent(selectedFolder)}&order=created_at.desc&limit=24`
    : "select=id,titulo,arquivo_url,tipo,pasta,created_at&order=created_at.desc&limit=24";
  const assets = await selectSupabaseRows<MediaAsset>(
    "cms_media_assets",
    mediaQuery,
  );
  const folders = ["todos", "geral", "noticias", "departamentos", "banners", "videos", "documentos"];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[420px_1fr]">
      <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Biblioteca de mídia</p>
        <h2 className="mt-3 font-serif text-4xl font-black leading-tight">Envie imagens e arquivos para o portal.</h2>
        <p className="mt-4 leading-7 text-[#5a472c]">
          Use esta área para capas de notícias, banners, logos de departamentos, thumbnails e documentos oficiais. Depois copie a URL para reutilizar nos formulários.
        </p>

        <form action="/api/admin/media" method="post" encType="multipart/form-data" className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Arquivo</span>
            <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-[#b98e3b] bg-[#f7efd6] px-4 py-6 text-center text-sm font-semibold text-[#8b2f2b]">
              <UploadCloud size={30} />
              PNG, JPG, WEBP, GIF ou PDF até 10 MB
              <input
                name="arquivo"
                type="file"
                required
                disabled={!canUpload}
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                className="w-full max-w-[260px] text-xs disabled:cursor-not-allowed disabled:opacity-60"
              />
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
            <input
              name="titulo"
              disabled={!canUpload}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: Banner da AGO 2026"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Pasta</span>
            <select
              name="pasta"
              disabled={!canUpload}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {["geral", "noticias", "departamentos", "banners", "videos", "documentos"].map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={!canUpload}
            className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus size={18} />
            Enviar arquivo
          </button>
        </form>
      </section>

      <section className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Arquivos enviados</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Acervo do portal</h2>
          </div>
          <p className="text-sm text-white/52">{assets.length} arquivo(s)</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {folders.map((folder) => {
            const active = (selectedFolder ?? "todos") === folder;

            return (
              <a
                key={folder}
                href={folder === "todos" ? "/admin/midia" : `/admin/midia?pasta=${folder}`}
                className={`px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                  active ? "bg-[#f4cf6a] text-[#171006]" : "border border-white/12 text-white/58 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
                }`}
              >
                {folder}
              </a>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {assets.map((asset) => (
            <article key={asset.id} className="overflow-hidden border border-white/10 bg-white/[0.055]">
              <div className="relative grid aspect-video place-items-center bg-black/30">
                {asset.tipo?.startsWith("image/") ? (
                  <Image src={asset.arquivo_url} alt={asset.titulo ?? "Arquivo enviado"} fill className="object-cover" />
                ) : (
                  <FileImage size={42} className="text-[#f4cf6a]" />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{asset.pasta ?? "geral"}</p>
                <h3 className="mt-2 font-serif text-2xl font-black">{asset.titulo ?? "Arquivo sem título"}</h3>
                <label className="mt-4 flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/64">
                  <Copy size={15} className="shrink-0 text-[#f4cf6a]" />
                  <input readOnly value={asset.arquivo_url} className="w-full bg-transparent outline-none" />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyUrlButton value={asset.arquivo_url} />
                  <a
                    href={asset.arquivo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/70 transition hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
                  >
                    <ExternalLink size={15} />
                    Abrir
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {assets.length === 0 ? (
          <div className="mt-8 border border-white/10 bg-white/[0.055] p-6 text-white/62">
            Nenhum arquivo enviado ainda. O primeiro upload já ficará disponível aqui com URL pública para uso no portal.
          </div>
        ) : null}
      </section>
    </div>
  );
}
