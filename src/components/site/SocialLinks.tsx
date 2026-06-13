import { Facebook, Instagram, Youtube } from "lucide-react";

type SocialLinksProps = {
  facebookUrl: string;
  instagramUrl: string;
  youtubeChannelUrl: string;
};

export function SocialLinks({ facebookUrl, instagramUrl, youtubeChannelUrl }: SocialLinksProps) {
  return (
    <div className="mt-5 flex gap-7">
      <a href={facebookUrl || "#"} target={facebookUrl ? "_blank" : undefined} rel={facebookUrl ? "noreferrer" : undefined} aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-lg bg-[#D4A24C] text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#0F3B63]">
        <Facebook size={20} />
      </a>
      <a href={instagramUrl || "#"} target={instagramUrl ? "_blank" : undefined} rel={instagramUrl ? "noreferrer" : undefined} aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg bg-[#D4A24C] text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#0F3B63]">
        <Instagram size={20} />
      </a>
      <a href={youtubeChannelUrl} target="_blank" rel="noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-lg bg-[#D4A24C] text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#0F3B63]">
        <Youtube size={20} />
      </a>
    </div>
  );
}
