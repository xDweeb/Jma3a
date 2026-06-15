import { defineConfig } from 'vite';

const repoName = 'imposter';

export default defineConfig({
  base: process.env.GITHUB_REPOSITORY?.endsWith(`/${repoName}`) ? `/${repoName}/` : '/',
});
