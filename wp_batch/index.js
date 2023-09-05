import axios from "axios";
import { randomUUID } from "crypto";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { createWriteStream } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

const LOCAL_URL = "http://localhost:5173";
const WORDPRESS_URL = "http://localhost:8888";

const firebaseConfig = {
    apiKey: "AIzaSyA6psVQGugH5tf9ZNM6iT4zJQ7MMnU3KIQ",
    authDomain: "nobles-20183.firebaseapp.com",
    databaseURL: "https://nobles-20183-default-rtdb.firebaseio.com",
    projectId: "nobles-20183",
    storageBucket: "nobles-20183.appspot.com",
    messagingSenderId: "401842201893",
    appId: "1:401842201893:web:7f09b789d4b312874826cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function batchRead() { 
    const articles = await getDocs(collection(db,`volumes/112/articles`));
    const out = [];
    articles.forEach(article => {
        const data = article.data();
        out.push({
            title: data.title,
            author: data.author.name,
            content: data.content,
            publishTime: (data.datePublished || {seconds: 0}).seconds,
            thumbnail: data.previewImageUrl
        })
    });
    await writeFile("articles.json",JSON.stringify(out));
}

async function batchImageDownload() {
    const articles = JSON.parse(await readFile("articles.json"));
    for ( const article of articles ) {
        for ( const comp of article.content ) {
            if ( comp.type == "image" ) {
                const path = `${randomUUID()}.jpg`;
                comp.data.src = path;
                await new Promise(resolve => {
                    axios({
                        url: comp.data.url,
                        responseType: "stream"
                    }).then(response => {
                        response.data.pipe(createWriteStream(`images/${path}`));
                        resolve();
                    });
                });
            }
        }
    }
    await writeFile("articles.json",JSON.stringify(articles));
}

async function batchThumbnailDownload() {
    const articles = JSON.parse(await readFile("articles.json"));
    for ( const article of articles ) {
        if ( ! article.thumbnail || article.thumbnailSrc ) continue;
        const path = `${randomUUID()}.jpg`;
        console.log(path);
        article.thumbnailSrc = path;
        await new Promise(resolve => {
            axios({
                url: article.thumbnail,
                responseType: "stream"
            }).then(response => {
                response.data.pipe(createWriteStream(`images/${path}`));
                resolve();
            });
        });
    }
    await writeFile("articles.json",JSON.stringify(articles));
}

async function batchWrite() {
    const articles = JSON.parse(await readFile("articles.json"))
        .filter(article => article.thumbnailSrc)
        .sort((a,b) => a.publishTime - b.publishTime);

    const maxConnections = 20;

    let i = 0;
    while ( i < articles.length ) {
        const promises = [];
        for ( let startI = i; i < Math.min(startI + maxConnections,articles.length); i++ ) {
            promises.push(writeArticle(articles[i]));
        }
        await Promise.all(promises);
    }
}

function writeArticle(article) {
    if ( ! article.title ) return;
    const form = new FormData();
    form.append("title",article.title);
    form.append("content",articleToHTML(article));
    form.append("status","publish");
    if ( article.thumbnailSrc ) form.append("feat_path",join(cwd(),"images",article.thumbnailSrc));

    return new Promise(resolve => {
        axios.post(`${WORDPRESS_URL}/update-post.php`,form)
            .then(response => {
                console.log(`Completed ${article.title}, ID ${response.data}`);
                resolve();
            });
    });
}

function articleToHTML(article) {
    const tags = [`<p>By ${article.author}</p>`];

    for ( const comp of article.content ) {
        if ( comp.type == "image" ) {
            const descFields = [
                comp.data.caption && comp.data.caption.trim() != "" ? comp.data.caption : null,
                comp.data.credit && comp.data.credit.trim() != "" ? `Credit: ${comp.data.credit}` : null
            ].filter(item => item != null);
            tags.push(`<p><img src="${LOCAL_URL}/content/old_images/${comp.data.src}" /><i>${descFields.join(" / ")}</i></p>`);
        } else {
            const tagName = comp.type == "quote" ? "blockquote" : "p";
            tags.push(`<${tagName}>${comp.data.text}</${tagName}>`);
        }
    }

    return tags.join("\n");
}

batchWrite();