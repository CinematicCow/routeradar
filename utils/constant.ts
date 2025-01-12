import type { FrameworkConfig } from "../types";

export const NEXTJS_PAGE_FILE = 'index.js';
export const SVELTEKIT_PAGE_FILE = '+page.svelte';

export const FRAMEWORKS: Array<FrameworkConfig> = [
  {
    name: "nextjs",
    detectFile: "next.config.js",
    pageDir: "pages",
    pageFileName: "index.{js,ts,jsx,tsx}",
    loadTemplate: (isTypeScript) => `
      export const getServerSideProps = async () => {
      return { props: {} };
    };`,
    pageTemplate: (isTypeScript) => `
      import React from 'react';

      export default function Page() {
        return (
          <h1>Black magic habibi</h1>
        );
      }`,
  },
  {
    name: "sveltekit",
    detectFile: "svelte.config.js",
    pageDir: "src/routes",
    pageFileName: "+page.svelte",
    loadTemplate: (isTypeScript) => `
      export const load = async () => {
        return {};
      };`,
    pageTemplate: (isTypeScript) => `
      <h1>Black magic habibi</h1>`,
  },
]
