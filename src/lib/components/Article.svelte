<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Component from "./Component.svelte";
    import { articleID, volumes, currentVolume } from "../stores";
    import type { Article, ArticleComponent, ComponentInteractions } from "../types";
    import ArticleControlBar from "./ArticleControlBar.svelte";

    let article: Article;

    const fetchArticle = async (id: number | null) => {
        if ( id === null ) {
            article = null;
            return;
        }

        const response = await fetch(`/api/article?id=${id}`);
        article = await response.json();
    }

    articleID.subscribe(fetchArticle);

    const updateArticle = async () => {
        await fetch(`/api/article?id=${article.id}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(article)
        });
    }

    $: {
        if ( article ) updateArticle();
    }

    const dispatch = createEventDispatcher();
    const reloadArticleList = () => dispatch("shouldReloadArticleList");

    const addComp = (index: number) => {
        article.content.splice(index,0,{data: {text: ""}, type: "paragraph"});
        article = article;
    }

    const setArticleVolume = async event => {
        await updateArticle();
        const volume = event.target.value;
        article.volume = volume;
        currentVolume.set(volume);
    }

    const getCompInteractions = (comp: ArticleComponent,index: number): ComponentInteractions => {
        return {
            isFirst: index == 0,
            isLast: index == article.content.length - 1,
            moveUp: () => {
                article.content.splice(index,1);
                article.content.splice(index - 1,0,comp);
                article = article;
            },
            moveDown: () => {
                article.content.splice(index,1);
                article.content.splice(index + 1,0,comp);
                article = article;
            },
            delete: () => {
                article.content.splice(index,1);
                article = article;
            }
        }
    }
</script>

{#if article}
    <!-- svelte-ignore a11y-interactive-supports-focus -->
    <span class="text-input h3" role="textbox" contenteditable bind:innerText={article.title} on:keyup={reloadArticleList}></span>
    <div class="d-flex flex-row justify-content-between">
        <div class="flex-grow-1">
            By: 
            <!-- svelte-ignore a11y-interactive-supports-focus -->
            <span class="text-input author-input" role="textbox" contenteditable bind:innerText={article.author} on:keyup={reloadArticleList}></span>
        </div>
        <div>
            Volume:
            <select class="form-control" on:change={setArticleVolume} bind:value={article.volume}>
                {#each $volumes as volume}
                    <option>{ volume }</option>
                {/each}
            </select>
        </div>
    </div>
    <ArticleControlBar bind:article={article} reloadArticle={() => fetchArticle(article.id)} reloadArticleList={reloadArticleList} />
    {#each article.content as comp,index}
        <div class="d-flex">
            <div class="flex-grow-1 line"></div>
            <button class="add-button" on:click={() => addComp(index)}>+</button>
            <div class="flex-grow-1 line"></div>
        </div>
        <Component bind:comp={comp} interactions={getCompInteractions(comp,index)} />
    {/each}
    <div class="d-flex">
        <div class="flex-grow-1 line"></div>
        <button class="add-button" on:click={() => addComp(article.content.length)}>+</button>
        <div class="flex-grow-1 line"></div>
    </div>
{/if}

<style>
    .text-input {
        border-bottom: 1px solid #ccc;
        width: 100%;
        display: inline-block;
    }
    .line {
        border: 0.5px solid #ccc;
        height: 0;
        margin: auto;
    }
    .author-input {
        width: calc(100% - 3em);
    }
    select.form-control {
        display: inline;
        width: unset;
    }
    .add-button {
        color: #888;
        border: 1px solid #888;
        height: 35px;
        flex-basis: 35px;
        flex-shrink: 0;
        border-radius: 100%;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        background-color: white;
        transition: background-color 0.2s ease;
    }
    .add-button:hover {
        background-color: #ddd;
    }
    .add-button:active {
        background-color: #aaa;
    }
</style>