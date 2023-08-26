<script lang="ts">
    import { articleID, volumes, currentVolume } from "../stores";
    import type { Article, VolumeStatus } from "../types";

    let articles: Article[],isVolumePublished: boolean;

    const getVolumePublished = async (volume: string): Promise<boolean> => {
        const response = await fetch("/api/volume");
        const volumeData: VolumeStatus[] = await response.json();
        return volumeData.filter(status => status.title == volume)[0].isPublished;
    }

    export const reloadArticles = async () => {
        if ( ! $currentVolume ) return;

        const response = await fetch(`/api/articles_by_volume?volume=${$currentVolume}`);
        articles = await response.json();

        isVolumePublished = await getVolumePublished($currentVolume);
    }

    currentVolume.subscribe(reloadArticles);

    const createBlank = async () => {
        const response = await fetch(`/api/article?volume=${$currentVolume}`,{method: "POST"});
        articleID.set((await response.json()).id);
        reloadArticles();
    }

    let fileRef;

    const createFromZip = async event => {
        if ( event.target.files.length == 0 ) return;
        const files = event.target.files;
        
        const formData = new FormData();
        formData.append("file-count",files.length);
        for ( let i = 0; i < files.length; i++ ) formData.append(`file-${i}`,files[i]);
        formData.append("volume",$currentVolume);

        const response = await fetch("/api/upload_zip",{
            method: "POST",
            body: formData
        });
        const newIDs = await response.json();

        articleID.set(newIDs[0]);
        reloadArticles();
    }

    const setVolumePublished = async (publish: boolean) => {
        await fetch(`/api/publish?type=volume&volume=${encodeURIComponent($currentVolume)}&publish=${publish ? 1 : 0}`,{method: "POST"});
        isVolumePublished = publish;
    }
</script>

{#if volumes}
    <div class="d-flex flex-row justify-content-center">
        <div>
            Volume/edition:
            <select class="form-control" bind:value={$currentVolume} on:change={() => {reloadArticles(); articleID.set(null)}}>
                {#each $volumes as volume}
                    <option>{ volume }</option>
                {/each}
            </select>
        </div>
    </div>
    {#if ! isVolumePublished}
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
    <div class="d-flex flex-row justify-content-center">
        <button class="btn btn-primary" on:click={() => setVolumePublished(! isVolumePublished)}>{ isVolumePublished ? "Unpublish" : "Publish" }</button>
    </div>
{/if}
<br />
{#if articles}
    {#each articles as article,index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class={`row article ${index == articles.length - 1 ? "bottom-edge" : ""}`} on:click={() => articleID.set(article.id)}>
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