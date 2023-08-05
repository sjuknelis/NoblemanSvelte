import { json } from "@sveltejs/kit";
import { getDB } from "$lib/getDB";
import { AsyncDatabase } from "promised-sqlite3";

export async function GET({ url }) {
    const db = await AsyncDatabase.open("db.db");
    return json(await db.all(
        `select id,title,author from articles where volume=?`,
        url.searchParams.get("volume")
    ));
}