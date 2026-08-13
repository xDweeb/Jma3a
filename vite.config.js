import { defineConfig } from 'vite';

const repoName = 'Jma3a';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : `/${repoName}/`,
}));
