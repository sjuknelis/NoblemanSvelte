import { json } from "@sveltejs/kit";
import { createArticle, readArticle, updateArticle, deleteArticle } from "$lib/articleDB";

export async function POST({ request }) {
    return json({
        id: await createArticle()
    });
}

export async function GET({ url }) {
    return json(await readArticle(url.searchParams.get("id")));
}

export async function PUT({ request }) {
    await updateArticle(await request.json());
    return json({ok: true});
}

export async function DELETE({ request }) {
    await deleteArticle(request.searchParams.get("id"));
    return json({ok: true});
}