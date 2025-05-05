import { getSortedPostsMeta } from "./getPosts";

export const getAllTags = async () => {
  const meta = await getSortedPostsMeta();
  let tags: string[] = [];
  meta.forEach((m) => {
    if (m?.data?.tags) {
      tags = [...tags, ...m.data.tags];
    }
  });
  return tags;
};

export const getUniqueTags = async () => {
  const allTags = await getAllTags();
  return Array.from(new Set(allTags));
};
