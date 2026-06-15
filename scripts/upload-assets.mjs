import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { Micro, Redacted } from "effect";
import dotenv from "dotenv";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const TOKEN_BASE64 = process.env.UPLOADTHING_TOKEN;
const tokenJson = JSON.parse(Buffer.from(TOKEN_BASE64, "base64").toString("utf-8"));
const API_KEY = tokenJson.apiKey;
const APP_ID = tokenJson.appId;
const REGION = tokenJson.regions?.[0] || "ewr1";
const INGEST_HOST = tokenJson.ingestHost || "ingest.uploadthing.com";
const INGEST_BASE = `https://${REGION}.${INGEST_HOST}`;

const ASSETS_DIR = join(__dirname, "..", "assets");
const categories = ["المتون", "الشروح"];

function getAllPDFs() {
  const files = [];
  for (const cat of categories) {
    const dir = join(ASSETS_DIR, cat);
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const full = join(dir, entry);
        if (statSync(full).isFile() && extname(entry).toLowerCase() === ".pdf") {
          files.push({ path: full, name: entry, category: cat });
        }
      }
    } catch (e) {
      console.error(`⚠️  Cannot read ${dir}:`, e.message);
    }
  }
  return files;
}

async function uploadAll() {
  const shared = await import("@uploadthing/shared");
  const { generateKey, generateSignedURL } = shared;

  const files = getAllPDFs();
  console.log(`📚 Found ${files.length} PDF files:\n`);
  files.forEach((f) => console.log(`   - ${f.category}/${f.name}`));
  console.log();

  const results = [];
  for (const file of files) {
    process.stdout.write(`📄 Uploading: ${file.name} ... `);
    try {
      const buf = readFileSync(file.path);
      const fileObj = { name: file.name, size: buf.length, type: "application/pdf", lastModified: Date.now() };
      const key = Micro.runSync(generateKey(fileObj, APP_ID));
      const signedUrl = await Micro.runPromise(generateSignedURL(`${INGEST_BASE}/${key}`, Redacted.make(API_KEY), {
        data: {
          "x-ut-identifier": APP_ID,
          "x-ut-file-name": file.name,
          "x-ut-file-size": buf.length,
          "x-ut-file-type": "application/pdf",
          "x-ut-content-disposition": "inline",
        },
      }));

      const formData = new FormData();
      formData.append("file", new Blob([buf], { type: "application/pdf" }), file.name);
      const resp = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Range": "bytes=0-", "x-uploadthing-version": "7.7.4" },
        body: formData,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Upload failed: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      const url = data.ufsUrl || data.url || `https://utfs.io/f/${key}`;
      console.log(`✅ ${url}`);
      results.push({ name: file.name, category: file.category, url, key });
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
  }

  console.log(`\n📊 Results: ${results.length}/${files.length} successful\n`);
  for (const r of results) {
    console.log(`  ${r.name}\n  ↳ ${r.url}\n`);
  }

  if (results.length > 0) {
    const outPath = join(ASSETS_DIR, "uploaded-files.json");
    writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`📝 Saved to: ${outPath}`);
  }
}

uploadAll().catch(console.error);
