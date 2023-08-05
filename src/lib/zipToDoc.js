import * as fs from "fs";
import * as cheerio from "cheerio";
import StreamZip from "node-stream-zip";
import mime from "mime";
import { randomUUID } from "crypto";
import { extname } from "path";
import { writeFile } from "fs/promises";

function htmlToDoc(html) {
    const $ = cheerio.load(html);
    const items = $("body").children();

    let content = [];
    for ( const item of items ) {
        const text = $(item).text();
        if ( text ) content.push({type: "text", text});
        else {
            const src = $(item).find("img").first().attr("src");
            if ( src ) content.push({type: "image", src});
        }
    }

    let title,author;
    let lastImage;
    for ( const comp of content ) {
        if ( comp.type == "text" ) {
            if ( comp.text.startsWith("Credit:") ) {
                lastImage.credit = comp.text.replace("Credit:","").trim();
                comp.remove = true;
            } else if ( comp.text.startsWith("Caption:") ) {
                lastImage.caption = comp.text.replace("Caption:","").trim();
                comp.remove = true;
            } else if ( comp.text.startsWith("Quote:") ) {
                comp.type = "quote";
                comp.text = comp.text.replace("Quote:","").trim();
            } else if ( comp.text.startsWith("Title:") ) {
                title = comp.text.replace("Title:","").trim();
                comp.remove = true;
            } else if ( comp.text.startsWith("Author:") ) {
                author = comp.text.replace("Author:","").trim();
                comp.remove = true;
            } else {
                comp.type = "paragraph";
            }
        } else if ( comp.type == "image" ) {
            lastImage = comp;
        }
    }
    content = content.filter(item => ! item.remove);

    return {
        title,
        author,
        content: content.map(comp => {
            return {
                data: comp,
                type: comp.type
            }
        })
    }
}

async function zipToDoc(path) {
    const zip = new StreamZip.async({
        file: path,
        storeEntries: true
    });

    const htmlName = Object.keys(await zip.entries()).filter(name => name.endsWith(".html"))[0];
    const doc = htmlToDoc((await zip.entryData(htmlName)).toString());

    for ( const comp of doc.content ) {
        if ( comp.type == "image" ) {
            const srcName = comp.data.src;
            const newSrcName = `content/images/${randomUUID()}` + extname(srcName);
            await writeFile(newSrcName,await zip.entryData(srcName));
            comp.data.src = newSrcName;
        }
    }

    await zip.close();

    return doc;
}

export { zipToDoc }