import { GetStaticProps, GetStaticPaths } from "next";
import { getUniqueTags } from "@/lib/getTags";
import { getPostsMetaWithTag } from "@/lib/getPosts";
import { PostMeta } from "@/lib/types";
import PageLayout from "@/layouts/PageLayout";
import PostListLayout from "@/layouts/PostListLayout";

const TagsPage = ({ tag, posts }: { tag: string; posts: PostMeta[] }) => {
  return (
    <PageLayout>
      <h1
        className={"pt-12 text-5xl font-bold text-dark-900 dark:text-dark-200"}
      >
        {tag}
      </h1>
      <h2 className={"text-xl font-semibold text-dark-700 dark:text-dark-300"}>
        All posts tagged with {tag}
      </h2>
      <PostListLayout posts={posts} />
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) {
    throw new Error("params is undefined");
  }
  const tag = params.tag as string;
  const posts = await getPostsMetaWithTag(tag);
  return {
    props: {
      tag,
      posts,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await getUniqueTags();
  const paths = tags.map((tag) => ({ params: { tag } }));
  return {
    paths,
    fallback: 'blocking',
  };
};

export default TagsPage;
