import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../", import.meta.url);

test("defines complete site metadata in the Next.js root layout", async () => {
  const layout = await readFile(new URL("src/app/layout.jsx", appRoot), "utf8");

  assert.match(layout, /InterFirst — We build internet-first companies/);
  assert.match(layout, /alternates: \{ canonical: "\/" \}/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);
  assert.match(layout, /manifest: "\/manifest\.webmanifest"/);
  assert.match(layout, /\/brand\/interfirst-mark\.png/);
  assert.match(layout, /NEXT_PUBLIC_SITE_URL/);
  assert.doesNotMatch(layout, /example\.(com|org|test)/);
});

test("uses the approved mark and generated InterFirst social card", async () => {
  const manifest = await readFile(new URL("src/app/manifest.js", appRoot), "utf8");

  assert.match(manifest, /name: "InterFirst"/);
  assert.match(manifest, /src: "\/brand\/interfirst-mark\.png"/);
  await access(new URL("public/brand/interfirst-mark.png", appRoot));
  await access(new URL("public/og.png", appRoot));
});

test("keeps the focused Careers application route out of search indexes", async () => {
  const careers = await readFile(new URL("src/app/careers/page.jsx", appRoot), "utf8");
  const robots = await readFile(new URL("src/app/robots.js", appRoot), "utf8");

  assert.match(careers, /alternates: \{ canonical: "\/careers" \}/);
  assert.match(careers, /index: false/);
  assert.match(careers, /follow: false/);
  assert.match(careers, /noarchive: true/);
  assert.match(robots, /disallow: \["\/careers"\]/);
});
