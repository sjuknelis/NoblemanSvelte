import { writeFile } from "fs/promises";
import { json } from "@sveltejs/kit";
import { extname, join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_PATH = "content/images";

export async function POST({ request }) {
    const file = (await request.formData()).get("file");
    const ext = extname(file.name);
    const uploadPath = join(UPLOAD_PATH,randomUUID() + ext);
    writeFile(uploadPath,Buffer.from(await file.arrayBuffer()));
    return json({"url": "/" + uploadPath});
}