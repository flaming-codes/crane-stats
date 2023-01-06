import { Octokit } from 'octokit';

const sdk = new Octokit({
  auth: process.env.GH_API_KEY
});

export async function getReposByStars() {
  const { data } = await sdk.rest.search.repos({
    q: `language:R`,
    sort: 'stars',
    order: 'desc',
    per_page: 100
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
        avatar_url: item.owner?.avatar_url
      }
    }))
  };
}

export async function getUsersByFollowers() {
  const { data } = await sdk.rest.search.users({
    q: `language:R`,
    sort: 'followers',
    order: 'desc',
    per_page: 100
  });

  const fetchCount = async (url: string) => {
    const res = await fetch(url);
    const items = await res.json();
    return items.length;
  };

  const enhancedItems = await Promise.all(
    data.items.map(async (item) => {
      const [followers, following, repos] = await Promise.all([
        fetchCount(item.followers_url),
        fetchCount(item.following_url.replace('{/other_user}', '')),
        fetchCount(item.repos_url)
      ]);
      return {
        ...item,
        followers,
        following,
        repos
      };
    })
  );
  return {
    data,
    items: enhancedItems.map((item) => ({
      id: item.id,
      node_id: item.node_id,
      login: item.login,
      avatar_url: item.avatar_url,
      html_url: item.html_url,
      followers: item.followers,
      following: item.following,
      repos: item.repos
    }))
  };
}
