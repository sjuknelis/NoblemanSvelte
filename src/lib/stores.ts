import { Writable, writable } from "svelte/store";
import type { VolumeStatus } from "./types";

export const articleID: Writable<number | null> = writable(null);

export const volumes: Writable<string[]> = writable([]);

export const currentVolume: Writable<string> = writable("113/1");

(async () => {
    const response = await fetch("/api/volume");
    const volumeData: VolumeStatus[] = await response.json();
    volumes.set(volumeData.map(status => status.title));

    const defaultVolume = localStorage.getItem("volume") || volumeData[0].title;
    currentVolume.set(defaultVolume);
    localStorage.setItem("volume",defaultVolume);
})();

currentVolume.subscribe((volume: string) => localStorage.setItem("volume",volume));