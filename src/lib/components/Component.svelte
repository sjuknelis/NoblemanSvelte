<script lang="ts">
    import type { ArticleComponent } from "../types";

    export let comp: ArticleComponent;

    const setType = (newType: string) => {
        if ( comp.type == newType ) return;

        if ( comp.type != "image" && newType != "image" ) {
            comp.type = newType;
            return;
        }

        comp.data.text = "";
        comp.data.src = "/placeholder.png";
        comp.data.url = "";
        comp.data.credit = "";
        comp.data.caption = "";
        comp.type = newType;
    }

    let fileRef;

    const uploadImage = async event => {
        if ( event.target.files.length == 0 ) return;
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append("file",file);
        
        const response = await fetch("/api/upload_image",{
            method: "POST",
            body: formData
        });
        comp.data.src = (await response.json()).src;
        comp.data.url = "";
    }
</script>

{#if comp.type != "image"}
    <span class={`text-input ${comp.type == "quote" ? "quote" : ""}`} role="textbox" contenteditable bind:innerText={comp.data.text}></span>
    <br />
{:else}
    <div class="container-60">
        <img src={comp.data.src} on:click={() => fileRef.click()} />
        <br />
        <br />
        <div class="row">
            <div class="col-2">
                Credit:
            </div>
            <div class="col-10">
                <span class="text-input" role="textbox" contenteditable bind:innerText={comp.data.credit}></span>
            </div>
        </div>
        <br />
        <div class="row">
            <div class="col-2">
                Caption:
            </div>
            <div class="col-10">
                <span class="text-input" role="textbox" contenteditable bind:innerText={comp.data.caption}></span>
            </div>
        </div>
    </div>
{/if}
<br />
<div class="d-flex flex-row justify-content-between">
    <div>
        <span class={`small-link ${comp.type == "paragraph" ? "black" : ""}`} on:click={() => setType("paragraph")}>Paragraph</span>
        <span class={`small-link ${comp.type == "quote" ? "black" : ""}`} on:click={() => setType("quote")}>Quote</span>
        <span class={`small-link ${comp.type == "image" ? "black" : ""}`} on:click={() => setType("image")}>Image</span>
    </div>
    <div>
        <span class="small-link">&#x2191;</span>
        <span class="small-link">&#x2193;</span>
        <span class="small-link">&times;</span>
    </div>
</div>

<input bind:this={fileRef} type="file" on:change={uploadImage} />

<style>
    .text-input {
        width: 100%;
        display: inline-block;
    }
    .text-input:empty {
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .quote {
        font-weight: bold;
        font-size: 150%;
        text-align: center;
    }
    .small-link {
        color: #888;
        cursor: pointer;
        padding-left: 0.5em;
        padding-right: 0.5em;
        transition: color 0.2s ease;
    }
    .small-link:hover {
        color: #444;
    }
    .small-link:active {
        color: #000;
    }
    .black {
        color: black;
    }
    .container-60 {
        width: 60%;
        text-align: center;
        margin: auto;
    }
    img {
        padding: 0;
        border-radius: 10px;
        width: 100%;
    }
    hr {
        margin-bottom: 0;
    }
    input[type="file"] {
        display: none;
    }
</style>