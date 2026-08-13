import { defineConfig } from 'vite';

const repoName = 'Jam3a';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : `/${repoName}/`,
}));
