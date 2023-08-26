import { getDB } from "./articleDB";
import { Article, VolumeStatus } from "./types";

const LOCAL_URL = "http://localhost:5173";
const WORDPRESS_URL = "http://localhost:8888";

export async function setVolumePublished(volume: string,publish: boolean) {
    const db = await getDB();
    const articles: Article[] = (await db.all(
        `select * from articles where volume=?`,
        volume
    )).map((item: any) => {
        return {
            ...item,
            content: JSON.parse(item.content),
            publishKeys: JSON.parse(item.publishKeys)
        }
    });

    for ( const article of articles ) {
        await updatePost(article,article.isPublished && publish);
    }
}

export async function updatePost(article: Article,forcePublishValue: boolean | undefined) {
    const db = await getDB();
    let publish: boolean;
    if ( forcePublishValue !== undefined ) {
        publish = forcePublishValue;
    } else {
        publish = article.isPublished;
        if ( publish ) {
            const volumeStatus: VolumeStatus = await db.get(
                `select isPublished from volumes where title=?`,
                article.volume
            );
            publish &&= volumeStatus.isPublished;
        }
    }

    const form = new FormData()
    form.append("title",article.title);
    form.append("content",articleToHTML(article));
    form.append("status",publish ? "publish" : "draft");
    if ( article.publishKeys.wpID !== undefined ) form.append("id",article.publishKeys.wpID.toString());

    const response = await fetch(
        `${WORDPRESS_URL}/update-post.php`,
        {
            method: "POST",
            body: form
        }
    );
    const responseText = await response.text();

    if ( responseText != "err" ) article.publishKeys.wpID = parseInt(responseText);
}

function articleToHTML(article: Article): string {
    const tags = [`<p>By ${article.author}</p>`];

    for ( const comp of article.content ) {
        if ( comp.type == "image" ) {
            tags.push(`<p><img src="${LOCAL_URL}/${comp.data.src}" /><i>${comp.data.caption} / Credit: ${comp.data.credit}</i></p>`);
        } else {
            const tagName = comp.type == "quote" ? "blockquote" : "p";
            tags.push(`<${tagName}>${comp.data.text}</${tagName}>`);
        }
    }

    return tags.join("\n");
}