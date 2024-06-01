import React from "react";
import Link from "next/link";
import { GetStaticProps } from "next";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { getSortedPostsMeta } from "@/lib/getPosts";
import { PostMeta } from "@/lib/types";
import Footer from "@/components/Footer";
import HomepagePostLayout from "@/layouts/HomepagePostLayout";

export default function Home({ posts }: { posts: PostMeta[] }) {
  return (
    <div>
      <Head>
        <title>Rohan&apos;s Website | Portfolio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={"bg-dark-100 px-4 dark:bg-black sm:px-8"}>
        <div
          className={
            "mx-auto flex w-full max-w-prose flex-col justify-center py-16"
          }
        >
          <section
            className={
              "mt-16 w-full self-start text-dark-900 dark:text-gray-50"
            }
          >
            <h1 className={"text-4xl font-semibold"}>Rohan Jain</h1>

          </section>
          <section className="my-8 space-y-4 text-lg">
            <img
              src="/images/pfp3.jpg"
              style={{
                width: "45%",
                float: "right",
                margin: "12px",
                borderRadius: "5%",
              }}
            ></img>
            <p>
              Hey! I'm Rohan, a rising sophomore at the <a href="https://cmu.edu" className="font-medium text-contrast-700 hover:text-contrast-500 dark:text-contrast-500 dark:hover:text-contrast-400" target="-blank">Carnegie Mellon</a>. I'm currently working towards a B.S. in Computer Science and M.S. in Mathematics.{" "}
            </p>
            <p>
              Talk to me about music! Check out some of my playlists {" "}
              <a href="https://open.spotify.com/user/rubiksunicorn37?si=319f3b377de843e4" className="font-medium text-contrast-700 hover:text-contrast-500 dark:text-contrast-500 dark:hover:text-contrast-400" target="-blank">here</a>.
            </p>
            <p>
              Check out&nbsp;
                <a href="/projects"className="font-medium text-contrast-700 hover:text-contrast-500 dark:text-contrast-500 dark:hover:text-contrast-400">
                  cd projects
                </a>
                &nbsp;or my GitHub (
              <a
                href="https://github.com/rjain37"
                target="_blank"
                rel="noreferrer"
                className={
                  "rounded bg-contrast-100 px-0.5 py-0.5 font-medium text-contrast-600 hover:text-contrast-500 dark:bg-contrast-900 dark:text-contrast-200 dark:hover:bg-contrast-800 dark:hover:text-contrast-100"
                }
              >
                @rjain37
              </a>
              ) to see my projects!
            </p>
          </section>
          <hr></hr>
          <br></br>
          <section className={"self-stretch"}>
            <h3 className="text-center text-2xl font-light text-dark-500">
              <code>ls /Posts</code>
            </h3>
            <HomepagePostLayout posts={posts} />
          </section>
          <hr></hr>
          <br></br>
          {/* <section  className={"self-stretch"}>
          <h3 className="text-center text-2xl font-light text-light-500">
              <code>ls /Recent Top Songs</code>
          </h3>
          </section> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getSortedPostsMeta();
  return {
    props: {
      posts,
    },
  };
};
