import { Octokit } from "octokit";
import fs from "node:fs";
import path from "node:path";
import { Provider } from "../provider";
import { DataAdapter } from "../adapter";

const sdk = new Octokit({
  auth: process.env.GITHUB_KEY,
});

async function getReposByStars(params?: { pushed?: string }) {
  // const { pushed = format(subDays(new Date(), 1), 'yyyy-MM-dd') } = params || {};

  const { data } = await sdk.rest.search.repos({
    q: `language:R`,
    sort: "stars",
    order: "desc",
    per_page: 50,
  });

  return {
    ...data,
    items: data.items.map((item) => ({
      id: item.id,
      name: item.name,
      full_name: item.full_name,
      html_url: item.html_url,
      description: item.description,
      stargazers_count: item.stargazers_count,
      watchers: item.watchers,
      owner: {
        login: item.owner?.login,
        avatar_url: item.owner?.avatar_url,
      },
    })),
  };
}

const provider = new Provider({ name: "github" });

export const adapter = new DataAdapter({ provider });
