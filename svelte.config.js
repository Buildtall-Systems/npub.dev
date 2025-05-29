import adapterStatic from "@sveltejs/adapter-static";
import adapterCloudflare from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isProd = process.env.NODE_ENV === 'production' || process.env.CF_PAGES;

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: isProd ? adapterCloudflare() : adapterStatic({ fallback: "index.html" }),
    paths: { base: "" },
    prerender: { entries: [] },
  },
};

export default config;
