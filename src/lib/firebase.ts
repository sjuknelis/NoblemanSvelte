import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import { getType } from "mime";
import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, updateDoc, serverTimestamp, doc, getDoc, arrayUnion, setDoc, DocumentReference } from "firebase/firestore";
import { getDownloadURL, getStorage, uploadBytes, ref } from "firebase/storage";
import type { Article } from "./types";

const firebaseConfig = null/*{
    apiKey: "AIzaSyA6psVQGugH5tf9ZNM6iT4zJQ7MMnU3KIQ",
    authDomain: "nobles-20183.firebaseapp.com",
    databaseURL: "https://nobles-20183-default-rtdb.firebaseio.com",
    projectId: "nobles-20183",
    storageBucket: "nobles-20183.appspot.com",
    messagingSenderId: "401842201893",
    appId: "1:401842201893:web:7f09b789d4b312874826cc"
};*/

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export async function setEditionPublished(volume: string,isPublished: boolean) {
    await updateDoc(
        doc(db,`volumes/${volume.split("/")[0]}/editions/${volume.split("/")[1]}`),
        {
            published: isPublished
        }
    );
}

export async function updateDocs(article: Article): Promise<boolean> { 
    if ( ! article.publishKeys.id || ! article.publishKeys.statIndex ) {
        return await createDocs(article);
    }

    const articleDoc = doc(db,`volumes/${getVolume(article)}/articles/${article.publishKeys.id}`);
    await setDoc(
        articleDoc,
        await articleToDoc(article)
    );

    const statDoc = doc(db,`volumes/${getVolume(article)}/editions/${getEdition(article)}`);
    const statDocContent = (await getDoc(statDoc)).data();
    if ( ! statDocContent ) return false;
    statDocContent.articles[article.publishKeys.statIndex] = articleToStatObj(article,articleDoc);
    await setDoc(
        statDoc,
        statDocContent
    );
    
    return true;
}

async function createDocs(article: Article): Promise<boolean> {
    const articleDoc = await addDoc(
        collection(db,`volumes/${getVolume(article)}/articles`),
        await articleToDoc(article)
    );
    article.publishKeys.id = articleDoc.id;

    const statDoc = doc(db,`volumes/${getVolume(article)}/editions/${getEdition(article)}`);
    const statDocContent = (await getDoc(statDoc)).data();
    if ( ! statDocContent ) return false;
    article.publishKeys.statIndex = statDocContent.articles.length;
    await updateDoc(
        statDoc,
        {
            articles: arrayUnion(articleToStatObj(article,articleDoc))
        }
    );

    return true;
}

async function articleToDoc(article: Article) {
    for ( const comp of article.content ) {
        if ( comp.type == "image" && ! comp.data.url ) {
            if ( ! comp.data.src ) continue;
            comp.data.url = await uploadImage(comp.data.src);
        }
    }

    return {
        title: article.title,
        author: {
            name: article.author
        },
        content: article.content,
        published: article.isPublished,
        previewImageUrl: getPreviewImageURL(article),
        datePublished: serverTimestamp(),
        views: 0
    };
}

function articleToStatObj(article: Article,articleDoc: DocumentReference) {
    return {
        title: article.title,
        author: {
            name: article.author
        },
        published: article.isPublished,
        previewImageUrl: getPreviewImageURL(article),
        id: articleDoc
    };
}

async function uploadImage(imageSrc: string) {
    const imageFile = await readFile(imageSrc);
    const imageRef = ref(storage,`nobleman/${randomUUID()}`);
    await uploadBytes(
        imageRef,
        imageFile,
        {
            contentType: getType(imageSrc)
        }
    );
    return await getDownloadURL(imageRef);
}

const getVolume = (article: Article) => article.volume.split("/")[0];
const getEdition = (article: Article) => article.volume.split("/")[1];

const getPreviewImageURL = (article: Article) => article.content.filter(comp => comp.type == "image")[0].data.url;