import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]";
import PostEditor from "@/components/admin/PostEditor";
import NavBar from "@/components/NavBar";
import Head from "next/head";
import { useRouter } from "next/router";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  
  return (
    <>
      <Head>
        <title>Edit Post</title>
      </Head>
      <NavBar />
      <div className="min-h-screen bg-white pt-24 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PostEditor postId={id as string} isEditing={true} />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
