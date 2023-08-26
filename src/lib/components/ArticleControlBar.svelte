<script lang="ts">
    import { articleID } from "../stores";
    import type { Article } from "../types";

    export let article: Article,reloadArticle: () => void,reloadArticleList: () => void;

    const deleteArticle = async () => {
        if ( ! confirm("Are you sure you want to delete this article?") ) return;

        await fetch(`/api/article?id=${article.id}`,{method: "DELETE"});
        articleID.set(null);
        reloadArticleList();
    }

    const setArticlePublished = async (publish: boolean) => {
        await fetch(`/api/publish?type=article&id=${article.id}&publish=${publish ? "1" : "0"}`,{method: "POST"});
        reloadArticle();
    }
</script>

{#if ! article.isPublished}
    <button class="btn btn-primary" on:click={() => setArticlePublished(true)}>Publish</button>
    <button class="btn btn-danger" on:click={deleteArticle}>Delete</button>
{:else}
    <button class="btn btn-primary" on:click={() => setArticlePublished(false)}>Unpublish</button>
{/if}
