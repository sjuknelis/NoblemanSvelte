<script>
    import { createEventDispatcher } from "svelte";
    import Component from "./Component.svelte";

    export let articleID;

    let article;

    $: articleID, (async () => {
        const response = await fetch(`/api/article?id=${articleID}`);
        article = await response.json();
    })();

    $: {
        if ( article ) {
            fetch(`/api/article?id=${articleID}`,{
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(article)
            });
        }
    }

    const dispatch = createEventDispatcher();

    const addComp = index => {
        article.content.splice(index,0,{data: {text: ""}, type: "paragraph"});
        article = article;
    };
</script>

{#if article}
    <span class="text-input h3" role="textbox" contenteditable bind:innerText={article.title} on:keyup={() => dispatch("shouldReloadArticles")}></span>
    <div class="d-flex flex-row justify-content-between">
        <div class="flex-grow-1">
            By: 
            <span class="text-input author-input" role="textbox" contenteditable bind:innerText={article.author} on:keyup={() => dispatch("shouldReloadArticles")}></span>
        </div>
        <div>
            Volume:
            <select class="form-control">
                <option>113/1</option>
            </select>
        </div>
    </div>
    {#each article.content as comp,index}
        <div class="d-flex">
            <div class="flex-grow-1 line"></div>
            <button class="add-button" on:click={() => addComp(index)}>+</button>
            <div class="flex-grow-1 line"></div>
        </div>
        <Component bind:comp={comp} />
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