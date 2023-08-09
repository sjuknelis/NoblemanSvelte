import { json } from "@sveltejs/kit";
import { getDB } from "$lib/articleDB";

export async function GET({ url }) {
    const db = await getDB();
    return json(await db.all(
        `select id,title,author from articles where volume=?`,
        url.searchParams.get("volume")
    ));
}