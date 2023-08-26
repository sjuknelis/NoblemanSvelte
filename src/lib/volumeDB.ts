import type { VolumeStatus } from "./types";
import { getDB } from "./articleDB";

export async function readVolumes(): Promise<VolumeStatus[]> {
    const db = await getDB();
    const volumeData: any = await db.all(
        `select title,isPublished from volumes`
    );
    return volumeData.map((volume: any) => {
        return {
            title: volume.title,
            isPublished: volume.isPublished == 1
        }
    });
}

export async function updateVolume(volume: VolumeStatus) {
    const db = await getDB();
    await db.run(
        `update volumes set isPublished=? where title=?`,
        volume.isPublished,
        volume.title
    );
}