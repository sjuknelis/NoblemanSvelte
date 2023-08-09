import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import { getType } from "mime";
import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, updateDoc, serverTimestamp, doc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, uploadBytes, ref } from "firebase/storage";

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
const storage = getStorage(app);

export async function setEditionPublished(volume,isPublished) {
    console.log(volume,isPublished);
    await updateDoc(
        doc(db,`volumes/${volume.split("/")[0]}/editions/${volume.split("/")[1]}`),
        {
            published: isPublished
        }
    );
}

export async function updateDocs(article) { 
    if ( ! article.publishKeys.id ) {
        await createDocs(article);
        return;
    }

    const articleDoc = doc(db,`volumes/${getVolume(article)}/articles/${article.publishKeys.id}`);
    await setDoc(
        articleDoc,
        await articleToDoc(article)
    );

    const statDoc = doc(db,`volumes/${getVolume(article)}/editions/${getEdition(article)}`);
    const statDocContent = (await getDoc(statDoc)).data();
    statDocContent.articles[article.publishKeys.statIndex] = articleToStatObj(article,articleDoc);
    await setDoc(
        statDoc,
        statDocContent
    )
}

async function createDocs(article) {
    const articleDoc = await addDoc(
        collection(db,`volumes/${getVolume(article)}/articles`),
        await articleToDoc(article)
    );
    article.publishKeys.id = articleDoc.id;

    const statDoc = doc(db,`volumes/${getVolume(article)}/editions/${getEdition(article)}`);
    article.publishKeys.statIndex = (await getDoc(statDoc)).data().articles.length;
    await updateDoc(
        statDoc,
        {
            articles: arrayUnion(articleToStatObj(article,articleDoc))
        }
    );
}

async function articleToDoc(article) {
    for ( const comp of article.content ) {
        if ( comp.type == "image" && ! comp.data.url ) {
            console.log(comp);
            comp.data.url = comp.data.src = await uploadImage(comp.data.src);
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

function articleToStatObj(article,articleDoc) {
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

async function uploadImage(imageSrc) {
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

const getVolume = article => article.volume.split("/")[0];
const getEdition = article => article.volume.split("/")[1];

const getPreviewImageURL = article => article.content.filter(comp => comp.type == "image")[0].data.url