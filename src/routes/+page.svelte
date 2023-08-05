<script>
    import Article from "../lib/Article.svelte";
import ArticleList from "../lib/ArticleList.svelte";

    let list,articleID;
</script>

<div class="row">
    <div class="col-3">
        <ArticleList bind:this={list} bind:articleID={articleID} />
    </div>
    <div class="col-9">
        {#if articleID}
            <Article articleID={articleID} on:shouldReloadArticles={() => {list.reloadArticles(); console.log("h")}} />
        {/if}
    </div>
</div>