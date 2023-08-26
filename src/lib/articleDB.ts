import { AsyncDatabase } from "promised-sqlite3";

const defaultArticle: Article = {
    id: -1,
    title: "",
    author: "",
    volume: "113/1",
    content: [],
    isPublished: false,
    publishKeys: {}
};

export async function createArticle(article: Article): Promise<number> {
    if ( ! article ) article = defaultArticle;
    const db = await getDB();
    const query = await db.run(
        `insert into articles (title,author,volume,content,isPublished,publishKeys) values (?,?,?,?,false,"{}")`,
        article.title,
        article.author,
        article.volume,
        JSON.stringify(article.content)
    );
    return query.lastID;
}

export async function readArticle(id: Number): Promise<Article> {
    const db = await getDB();
    const row = await db.get(
        `select id,title,author,volume,content,isPublished,publishKeys from articles where id=?`,
        id
    );
    row.content = JSON.parse(row.content);
    row.publishKeys = JSON.parse(row.publishKeys);
    return row;
}

export async function updateArticle(article: Article) {
    const db = await getDB();
    await db.run(
        `update articles set title=?,author=?,volume=?,content=?,isPublished=?,publishKeys=? where id=?`,
        article.title,
        article.author,
        article.volume,
        JSON.stringify(article.content),
        article.isPublished,
        JSON.stringify(article.publishKeys),
        article.id
    );
}

export async function deleteArticle(id: number) {
    const db = await getDB();
    await db.run(
        `delete from articles where id=?`,
        id
    );
}

export const getDB = (() => {
    let db;

    return async () => {
        if ( ! db ) db = await AsyncDatabase.open("db.sqlite");
        return db;
    }
})();