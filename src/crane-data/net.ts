import type { CraneDataIdItem } from './types';

let idItems: CraneDataIdItem[] = [];
// Author's name w/ authored package names
let authorItems: Record<string, string[]> = {};

/**
 *
 * @returns
 */
export async function fetchCraneDataIdItems() {
  if (!idItems) {
    const url = process.env.CRANE_ID_ITEMS_URL;
    if (!url) {
      throw new Error('CRANE_ID_ITEMS_URL not set');
    }

    const raw = await fetcher<[string, string][]>(url, '');
    idItems = raw.map(([id, slug]) => ({ id, slug }));
  }

  return idItems;
}

export async function fetchCraneDataAuthors() {
  if (!authorItems) {
    const url = process.env.CRANE_AUTHOR_ITEMS_URL;
    if (!url) {
      throw new Error('CRANE_AUTHOR_ITEMS_URL not set');
    }

    authorItems = await fetcher<typeof authorItems>(url, '');
  }
  return authorItems;
}

const fetcher = async <T>(href: string, path?: string): Promise<T> => {
  // @ts-expect-error 'fetch' not picked up by ts-node.
  return fetch(href + (path || ''), {
    headers: {
      Authorization: `Token ${process.env.CRANE_DATA_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }).then((res: any) => {
    if (res.ok) {
      return res.json();
    }

    console.error('fetcher', res.status, res.statusText, href, path);

    return [];
  });
};
