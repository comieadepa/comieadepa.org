"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CmsGalleryPhoto } from "@/lib/galerias";

export function GalleryLightbox({ photos, galleryTitle }: { photos: CmsGalleryPhoto[]; galleryTitle: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? null : (current + 1) % photos.length));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === null ? null : (current - 1 + photos.length) % photos.length));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, photos.length]);

  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group overflow-hidden border border-[#0F3B63]/10 bg-white text-left shadow-[0_18px_50px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.12)]"
          >
            <div className="relative aspect-[4/3] bg-[#E5ECF3]">
              <Image src={photo.imagem_url} alt={photo.legenda || galleryTitle} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" />
            </div>
            {(photo.legenda || photo.credito) ? (
              <div className="grid gap-1 p-4">
                {photo.legenda ? <p className="font-semibold text-[#0F3B63]">{photo.legenda}</p> : null}
                {photo.credito ? <p className="text-sm text-[#6B7280]">{photo.credito}</p> : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div className="fixed inset-0 z-[130] bg-black/86 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setActiveIndex(null)} className="grid h-11 w-11 place-items-center border border-white/20 bg-white/10 text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid flex-1 gap-4 lg:grid-cols-[72px_1fr_72px] lg:items-center">
              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current === null ? 0 : (current - 1 + photos.length) % photos.length))}
                className="hidden h-14 w-14 place-items-center border border-white/15 bg-white/10 text-white lg:grid"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="grid gap-4">
                <div className="relative aspect-[16/10] overflow-hidden border border-white/15 bg-black/30">
                  <Image src={activePhoto.imagem_url} alt={activePhoto.legenda || galleryTitle} fill className="object-contain" />
                </div>
                {(activePhoto.legenda || activePhoto.credito) ? (
                  <div className="grid gap-1 text-white">
                    {activePhoto.legenda ? <p className="text-lg font-semibold">{activePhoto.legenda}</p> : null}
                    {activePhoto.credito ? <p className="text-sm text-white/72">{activePhoto.credito}</p> : null}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current === null ? 0 : (current + 1) % photos.length))}
                className="hidden h-14 w-14 place-items-center border border-white/15 bg-white/10 text-white lg:grid"
                aria-label="Próxima foto"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
