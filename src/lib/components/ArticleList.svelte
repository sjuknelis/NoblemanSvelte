<script lang="ts">
    import { onMount } from "svelte";
    import type { Article } from "../types";

    export let articleID: number;

    let articles: Article[],volumes: string[],currentVolume: string;

    onMount(async () => {
        const response = await fetch("/content/volumes.json");
        volumes = await response.json();
        currentVolume = localStorage.getItem("volume") || volumes[0];
        localStorage.setItem("volume",currentVolume);
        reloadArticles();
    });

    export const reloadArticles = async () => {
        const response = await fetch(`/api/articles_by_volume?volume=${currentVolume}`);
        articles = await response.json();
    }

    const createBlank = async () => {
        const response = await fetch(`/api/article`,{method: "POST"});
        articleID = (await response.json()).id;
        reloadArticles();
    }

    let fileRef;

    const createFromZip = async event => {
        if ( event.target.files.length == 0 ) return;
        const files = event.target.files;
        
        const formData = new FormData();
        formData.append("file-count",files.length);
        for ( let i = 0; i < files.length; i++ ) formData.append(`file-${i}`,files[i]);
        formData.append("volume",currentVolume);

        const response = await fetch("/api/upload_zip",{
            method: "POST",
            body: formData
        });
        const newIDs = await response.json();

        articleID = newIDs[0];
        reloadArticles();
    }
</script>

{#if volumes}
    <div class="d-flex flex-row justify-content-center">
        <div>
            Volume/edition:
            <select class="form-control" bind:value={currentVolume} on:change={() => {reloadArticles(); articleID = null}}>
                {#each volumes as volume}
                    <option>{ volume }</option>
                {/each}
            </select>
        </div>
    </div>
    <br />
    <div class="d-flex flex-row justify-content-center">
        <button class="btn btn-success" on:click={createBlank}>+ Create blank</button>
    </div>
    <br />
    <div class="d-flex flex-row justify-content-center">
        <button class="btn btn-success" on:click={() => fileRef.click()}>+ Create from ZIP</button>
    </div>
{/if}
<br />
{#if articles}
    {#each articles as article,index}
        <div class={`row article ${index == articles.length - 1 ? "bottom-edge" : ""}`} on:click={() => articleID = article.id}>
            <p>
                <span class="h4">{ article.title || "(untitled)" }</span> by { article.author || "(unknown)" }
            </p>
        </div>
    {/each}
{/if}

<input bind:this={fileRef} type="file" multiple on:change={createFromZip} />

<style>
    .article {
        border-top: 1px solid #ccc;
        cursor: pointer;
        padding-top: 0.25em;
        padding-bottom: 0.25em;
    }
    .article * {
        margin-bottom: 0.25em;
    }
    .bottom-edge {
        border-bottom: 1px solid #ccc;
    }
    select.form-control {
        display: inline;
        width: unset;
    }
    input[type="file"] {
        display: none;
    }
</style>