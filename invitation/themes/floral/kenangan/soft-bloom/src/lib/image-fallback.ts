import type { SyntheticEvent } from "react";

export function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = "none";
}

export function hideBrokenImageContainer(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.parentElement?.style.setProperty("display", "none");
}
