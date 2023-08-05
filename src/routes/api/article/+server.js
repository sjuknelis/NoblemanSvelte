import { json } from "@sveltejs/kit";
import { getDB } from "$lib/getDB";

export async function _createArticle(article) {
    const db = await getDB();
    const query = await db.run(
        `insert into articles (title,author,volume,content) values (?,?,?,?)`,
        article.title,
        article.author,
        article.volume,
        JSON.stringify(article.content)
    );
    return query.lastID;
}

export async function POST({ request }) {
    const article = await request.json();
    return json({
        id: await _createArticle(article)
    });
}

export async function GET({ url }) {
    const db = await getDB();
    const row = await db.get(
        `select title,author,volume,content from articles where id=?`,
        url.searchParams.get("id")
    );
    row.content = JSON.parse(row.content);
    return json(row);
}

export async function PUT({ request,url }) {
    const db = await getDB();
    const article = await request.json();
    await db.run(
        `update articles set title=?,author=?,volume=?,content=? where id=?`,
        article.title,
        article.author,
        article.volume,
        JSON.stringify(article.content),
        url.searchParams.get("id")
    );
    return json({ok: true});
}

export async function DELETE({ request }) {
    const db = await getDB();
    await db.run(
        `delete from articles where id=?`,
        url.searchParams.get("id")
    );
    return json({ok: true});
}