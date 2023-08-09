import { json } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { unlink, writeFile } from "fs/promises";
import { zipToArticle } from "$lib/zipToArticle";
import { createArticle } from "$lib/articleDB";

export async function POST({ request }) {
    const formData = await request.formData();
    const fileCount = parseInt(formData.get("file-count"));

    const articles = [];
    for ( let i = 0; i < fileCount; i++ ) {
        const file = formData.get(`file-${i}`);
        const path = `archive-${randomUUID()}.zip`;

        await writeFile(path,Buffer.from(await file.arrayBuffer()));
        articles.push(await zipToArticle(path));
        await unlink(path);
    }

    const volume = formData.get("volume");
    const ids = [];
    for ( const article of articles ) {
        article.volume = volume;
        ids.push(await createArticle(article));
    }

    return json(ids);
}