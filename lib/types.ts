export interface PostData {
  title: string;
  date: string;
  tags?: string[];
  draft?: boolean;
  preview?: string;
}

export interface PostMeta {
  slug: string;
  data: PostData;
}

export interface Post extends PostMeta {
  content: string;
}

export interface Heading {
  text: string;
  anchor: string;
}
