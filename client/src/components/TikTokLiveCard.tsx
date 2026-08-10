import { ExternalLink, Radio } from "lucide-react";
import type { LiveStatus } from "@/lib/firebase";

const PROFILE_URL = "https://www.tiktok.com/@ajengandhika_";

export default function TikTokLiveCard({ status }: { status?: LiveStatus }) {
  const isLive = status?.isTikTokLive === true;
  const destination = isLive && status?.tiktokLiveUrl
    ? status.tiktokLiveUrl
    : PROFILE_URL;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8" aria-label="TikTok Tahunya Krispi-ya">
      <a
        href={destination}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col gap-4 rounded-2xl border bg-neutral-950 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 rounded-full bg-white p-0.5">
            <img src="/images/tiktok-profile.png" alt="Foto profil TikTok Tahunya Krispi-ya" className="h-full w-full rounded-full object-cover" />
            {isLive && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-neutral-950 bg-red-500" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">Tahunya Krispi-ya!</p>
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                  <Radio className="h-3.5 w-3.5" /> Live
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-300">@ajengandhika_</p>
            <p className="mt-1 text-sm text-neutral-400">
              {isLive ? "Kami sedang live—klik untuk menonton sekarang." : "Ikuti profil TikTok kami untuk info dan live terbaru."}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${isLive ? "bg-red-600" : "bg-white text-black"}`}>
          {isLive ? "Tonton LIVE" : "Lihat Profil"}
          <ExternalLink className="h-4 w-4" />
        </span>
      </a>
    </section>
  );
}
