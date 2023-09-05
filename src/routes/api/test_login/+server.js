import { json } from "@sveltejs/kit";

const PASSWORD = "abc";

export async function GET({ url }) {
    return json({ok: url.searchParams.get("pwd") == PASSWORD});
}