import { json } from "@sveltejs/kit";
import { readArticle } from "$lib/articleDB";
//import { setEditionPublished, updateDocs } from "$lib/firebase";
import { updateArticle } from "$lib/articleDB";
import { updateVolume } from "$lib/volumeDB";

export async function POST({ url }) {
    const requestType = url.searchParams.get("type");
    const toPublish = url.searchParams.get("publish") == "1";

    if ( requestType == "article" ) {
        const article = await readArticle(url.searchParams.get("id"));
        article.isPublished = toPublish;
        //await updateDocs(article);
        await updateArticle(article);
    } else if ( requestType == "volume" ) {
        //await setEditionPublished(url.searchParams.get("volume"),toPublish);
        await updateVolume({
            title: url.searchParams.get("volume"),
            isPublished: toPublish
        });
    }

    return json({ok: true});
}