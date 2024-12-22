import React from "react";
import DarkModeToggle from "./DarkModeToggle";
import GitHubButton from "./GitHubButton";
import Link from "next/link";
import { postsDir, tagsDir } from "../utils/routes";

const NavBar = () => {
  return (
    <nav
      className={`fixed z-10 flex min-w-full items-center justify-between py-4 px-4 backdrop-blur-[20px] backdrop-saturate-[1.8] backdrop-filter sm:px-10`}
    >
      <div className={"mx-auto flex w-full max-w-6xl justify-between"}>
        <div
          className={`navbar flex items-center space-x-3 text-xs sm:space-x-8 sm:text-lg`}
        >
            <a href="/">rohan's portfolio %</a>

            <a href={`/projects`}>
              <code>cd Projects</code>
            </a>
            <a href={`/posts`}>
              <code>cd Posts</code>
            </a>
            <a href={`/tags`}>
              <code>cd Tags</code>
            </a>
            <a href={`/photos`}>
              <code>cd Photos</code>
            </a>
        </div>
        <div className={`navbar flex items-center space-x-2 sm:space-x-6`}>
          <DarkModeToggle/>
          <GitHubButton/>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
