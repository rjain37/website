import { writeFileSync } from "fs";
import { getSortedPosts } from "@/lib/getPosts";
import path from "path";

const BASE_URL = "https://rohanja.in";
const cdata = (s: string) => `<![CDATA[${s}]]>`;

// Make this an async function
async function generateRSS() {
  // Await the posts
  const posts = await getSortedPosts();

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1">
  <channel>
    <title>Rohan's Website</title>
    <link>${BASE_URL}</link>
    <description>Rohan Jain's website</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map((post) =>
        `
    <item>
      <title>${cdata(post.data.title)}</title>
      <description>${
        post.data.preview ? cdata(post.data.preview) : ""
      }</description>
      <dc:creator>${cdata("Rohan Jain")}</dc:creator>
      <pubDate>${post.data.date ? new Date(post.data.date).toUTCString() : new Date().toUTCString()}</pubDate>
      <link>${BASE_URL}/posts/${post.slug}/</link>
      <guid>${BASE_URL}/posts/${post.slug}/</guid>
      ${(post.data.tags ?? [])
        .map((tag: string) => `<category>${cdata(tag)}</category>`)
        .join("\n      ")}
    </item>
    `.trim()
      )
      .join("\n    ")}
  </channel>
</rss>`;

  writeFileSync(path.join(process.cwd(), "public", "rss.xml"), rssFeed);
  console.log('RSS feed generated successfully!');
}

// Execute the async function
generateRSS().catch(error => {
  console.error('Failed to generate RSS feed:', error);
  process.exit(1);
});
