import { json } from "@sveltejs/kit";
import { readVolumes, updateVolume } from "$lib/volumeDB";

export async function GET() {
    return json(await readVolumes());
}