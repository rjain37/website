import { GetServerSideProps } from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import NavBar from "@/components/NavBar";
import Head from "next/head";

export default function SignIn({ providers }: { providers: any }) {
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <NavBar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-dark-900">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-50 p-10 shadow-md dark:bg-dark-800">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-primary-900 dark:text-primary-400">
              Sign In to Admin Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Only authorized users can access the admin dashboard.
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-3">
              {Object.values(providers).map((provider: any) => (
                <div key={provider.name}>
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/admin' })}
                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Sign in with {provider.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // If user is already signed in, redirect to admin
  if (session) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  const providers = await getProviders();
  return {
    props: { providers: providers ?? {} },
  };
};
