import { defineConfig } from 'vite';

const repoName = 'Jam3a';
const isGitHubPagesBuild = process.env.GITHUB_REPOSITORY?.endsWith(`/${repoName}`);

export default defineConfig({
  base: isGitHubPagesBuild ? `/${repoName}/` : '/',
});
