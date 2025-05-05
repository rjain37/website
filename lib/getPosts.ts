import { Post, PostMeta } from "./types";
import { firestore } from "@/lib/firebase/firebaseAdmin";

const LOCAL_MODE = process.env.USE_LOCAL_POSTS === "true";

// Fallback imports for local mode (backward compatibility)
import { postFiles, POSTS_PATH } from "@/utils/posts";
import matter from "gray-matter";
import fs from "fs";
import path from "path";

export const getAllPosts = async () => {
  // Use local file system if specified in env (backwards compatibility)
  if (LOCAL_MODE) {
    const posts: (Post & { path: string })[] = postFiles.map((file) => {
      const source = fs.readFileSync(path.join(POSTS_PATH, file.path));
      const { content, data } = matter(source);
      return {
        content,
        data,
        slug: file.slug,
        path: file.path,
      };
    });
    return posts;
  }
  
  // Use Firebase database
  try {
    const snapshot = await firestore.collection("posts").get();
    
    const posts: (Post & { path: string })[] = [];
    snapshot.forEach((doc) => {
      const postData = doc.data();
      const createdDate = postData.createdAt?.toDate?.() || new Date();
      posts.push({
        content: postData.content,
        data: {
          title: postData.title,
          date: createdDate.toISOString(), // Convert to ISO string for serialization
          preview: postData.preview || "",
          tags: postData.tags || [],
          ...(postData.published !== undefined ? { published: postData.published } : {}),
        },
        slug: postData.slug,
        path: `${postData.slug}.mdx`, // Create virtual path for compatibility
      });
    });
    
    return posts;
  } catch (error) {
    console.error("Error fetching posts from Firebase:", error);
    return [];
  }
};

export const getSortedPosts = async () => {
  const posts = await getAllPosts();
  posts.sort((a, b) => {
    if (a.data.date && b.data.date) {
      const datea = new Date(a.data.date);
      const dateb = new Date(b.data.date);
      return datea > dateb ? -1 : 1;
    }
    return a.data.date != undefined ? -1 : b.data.date != undefined ? 1 : 0;
  });
  return posts;
};

export const getSortedPostsMeta = async () => {
  const posts = await getSortedPosts();
  const meta: PostMeta[] = posts.map((post) => ({
    data: post.data,
    slug: post.slug,
  }));
  return meta;
};

export const getPostsMetaWithTag = async (tag: string) => {
  // Use local file system if specified in env (backwards compatibility)
  if (LOCAL_MODE) {
    const posts = await getSortedPostsMeta();
    return posts.filter((post) => post.data.tags?.includes(tag));
  }
  
  // Use Firebase with direct query
  try {
    const snapshot = await firestore
      .collection("posts")
      .where("tags", "array-contains", tag)
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    
    const posts: PostMeta[] = [];
    snapshot.forEach((doc) => {
      const postData = doc.data();
      const createdDate = postData.createdAt?.toDate?.() || new Date();
      posts.push({
        data: {
          title: postData.title,
          date: createdDate.toISOString(), // Convert to ISO string for serialization
          preview: postData.preview || "",
          tags: postData.tags || [],
          published: postData.published,
        },
        slug: postData.slug,
      });
    });
    
    return posts;
  } catch (error) {
    console.error("Error fetching posts with tag from Firebase:", error);
    return [];
  }
};

// Get a single post by slug
export const getPostBySlug = async (slug: string) => {
  // Use local file system if specified in env (backwards compatibility)
  if (LOCAL_MODE) {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug);
  }
  
  // Use Firebase with direct query
  try {
    const snapshot = await firestore
      .collection("posts")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const postData = doc.data();
    
    const createdDate = postData.createdAt?.toDate?.() || new Date();
    return {
      content: postData.content,
      data: {
        title: postData.title,
        date: createdDate.toISOString(), // Convert to ISO string for serialization
        preview: postData.preview || "",
        tags: postData.tags || [],
        published: postData.published,
      },
      slug: postData.slug,
      path: `${postData.slug}.mdx`, // Create virtual path for compatibility
    };
  } catch (error) {
    console.error("Error fetching post by slug from Firebase:", error);
    return null;
  }
};
