<script>
    import Article from "$lib/components/Article.svelte";
    import ArticleList from "$lib/components/ArticleList.svelte";

    let articleList,articleID;
</script>

<div class="row">
    <div class="col-3">
        <ArticleList bind:this={articleList} bind:articleID={articleID} />
    </div>
    <div class="col-9">
        {#if articleID}
            <Article articleID={articleID} on:shouldReloadArticles={articleList.reloadArticles} />
        {/if}
    </div>
</div>