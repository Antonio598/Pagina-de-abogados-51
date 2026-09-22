"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { landing } from "@content/landing";
import { track } from "@/lib/analytics";

// Video de la landing: solo se descarga cuando la persona toca "Reproducir".
// Sin autoplay: no consume datos móviles ni retrasa el contenido principal.
export const VideoBlock = ({ src, poster }: { src: string; poster?: string }) => {
  const [activo, setActivo] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-brand border border-gris bg-azul">
      {activo ? (
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setActivo(true);
            track("landing_video_play", { section: "landing_video" });
          }}
          className="group size-full"
          aria-label={landing.video.play}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura estática servida desde /public
            <img src={poster} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <span className="absolute inset-0 bg-grid-azul" aria-hidden />
          )}
          <span className="absolute inset-0 grid place-items-center bg-azul/35 transition-colors group-hover:bg-azul/45">
            <span className="flex items-center gap-3 rounded-full bg-blanco/95 px-5 py-3 text-azul shadow-card-hover">
              <Play className="size-5 fill-azul" aria-hidden />
              <span className="font-medium">{landing.video.play}</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
};
