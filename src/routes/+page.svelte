<script>
    import Article from "$lib/components/Article.svelte";
    import ArticleList from "$lib/components/ArticleList.svelte";

    let articleList;
</script>

<div class="row">
    <div class="col-3">
        <ArticleList bind:this={articleList} />
    </div>
    <div class="col-9">
        <Article on:shouldReloadArticleList={articleList.reloadArticles} />
    </div>
</div>