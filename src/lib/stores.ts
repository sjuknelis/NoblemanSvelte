import { writable } from "svelte/store";

export const articleID = writable(null);

export const volumes = writable([]);

export const currentVolume = writable("113/1");

(async () => {
    const response = await fetch("/content/volumes.json");
    const volumeData = await response.json();
    volumes.set(volumeData);

    const defaultVolume = localStorage.getItem("volume") || volumeData[0];
    currentVolume.set(defaultVolume);
    localStorage.setItem("volume",defaultVolume);
})();

currentVolume.subscribe((volume: string) => localStorage.setItem("volume",volume));