import { Article, ArticleComponent } from "./types";

export function getFirstImage(article: Article): ArticleComponent | null {
    for ( const comp of article.content ) {
        if ( comp.type == "image" ) return comp;
    }
    return null;
}