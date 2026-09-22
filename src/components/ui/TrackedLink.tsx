"use client";

import type { ComponentProps } from "react";
import { ButtonLink } from "./Button";
import { track, type AnalyticsEvent, type EventPayload } from "@/lib/analytics";

type Props = ComponentProps<typeof ButtonLink> & { event: AnalyticsEvent; payload?: EventPayload };

/** ButtonLink que emite un evento de medición al hacer clic (único trozo cliente del hero/cierres). */
export const TrackedLink = ({ event, payload, onClick, ...rest }: Props) => (
  <ButtonLink
    {...rest}
    onClick={(e) => {
      track(event, payload);
      onClick?.(e);
    }}
  />
);
