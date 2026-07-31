import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../", import.meta.url);
const repositoryRoot = new URL("../../../", import.meta.url);

test("uses npm workspaces for every root project command", async () => {
  const rootPackage = JSON.parse(
    await readFile(new URL("package.json", repositoryRoot), "utf8"),
  );

  assert.equal(rootPackage.packageManager, "npm@11.14.1");
  assert.deepEqual(rootPackage.workspaces, ["apps/web"]);
  assert.equal(
    rootPackage.scripts.build,
    "npm run build --workspace=@interfirst/web",
  );
  assert.equal(
    rootPackage.scripts.verify,
    "npm run verify --workspace=@interfirst/web",
  );
  await access(new URL("package-lock.json", repositoryRoot));
  await assert.rejects(access(new URL("pnpm-lock.yaml", repositoryRoot)));
  await assert.rejects(access(new URL("pnpm-workspace.yaml", repositoryRoot)));
});

test("uses Next.js App Router and Tailwind CSS as the web runtime", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", appRoot), "utf8"),
  );
  const globals = await readFile(new URL("src/app/globals.css", appRoot), "utf8");

  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.dependencies.next, "16.2.12");
  assert.equal(packageJson.devDependencies.tailwindcss, "4.3.3");
  assert.equal(packageJson.devDependencies["@tailwindcss/postcss"], "4.3.3");
  assert.match(globals, /@import "tailwindcss";/);
  assert.match(globals, /@theme inline/);
  assert.match(globals, /--color-surface: var\(--surface\)/);

  await access(new URL("src/app/layout.jsx", appRoot));
  await access(new URL("src/app/page.jsx", appRoot));
  await access(new URL("src/app/careers/page.jsx", appRoot));
  await access(new URL("next.config.mjs", appRoot));
  await access(new URL("postcss.config.mjs", appRoot));
});

test("removes the superseded Vite and Sites-worker runtime", async () => {
  for (const relativePath of [
    "index.html",
    "vite.config.mjs",
    "worker/index.js",
    ".openai/hosting.json",
    "src/main.jsx",
    "src/App.jsx",
  ]) {
    await assert.rejects(access(new URL(relativePath, appRoot)));
  }
});

test("keeps client-only behavior behind explicit route boundaries", async () => {
  const homePage = await readFile(
    new URL("src/components/HomePage.jsx", appRoot),
    "utf8",
  );
  const careersPage = await readFile(
    new URL("src/components/CareersPage.jsx", appRoot),
    "utf8",
  );

  assert.match(homePage, /^"use client";/);
  assert.match(careersPage, /^"use client";/);
  assert.match(homePage, /min-h-screen bg-surface/);
  assert.match(careersPage, /className="min-h-screen"/);
});
