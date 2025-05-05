import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import firebase from "firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET request - fetch posts
  if (req.method === "GET") {
    try {
      // Check query parameters
      const { published, limit, tag } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 100;
      
      // Start with basic query
      let postsQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore.collection("posts");
      
      // Filter for published status if specified
      if (published !== undefined) {
        postsQuery = postsQuery.where("published", "==", published === "true");
      }
      
      // Filter by tag if specified
      if (tag) {
        postsQuery = postsQuery.where("tags", "array-contains", tag);
      }
      
      // Order by created date descending and apply limit
      const postsSnapshot = await postsQuery
        .orderBy("createdAt", "desc")
        .limit(limitNum)
        .get();
      
      // Transform the data
      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || null,
      }));
      
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  } 
  // POST request - create a new post (requires authentication)
  else if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      // Check authentication
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { title, slug, content, preview, tags, published } = req.body;
      
      // Validate required fields
      if (!title || !slug || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if slug already exists
      const existingPost = await firestore
        .collection("posts")
        .where("slug", "==", slug)
        .get();
      
      if (!existingPost.empty) {
        return res.status(409).json({ error: "Slug already exists" });
      }
      
      // Create the post
      const postData = {
        title,
        slug,
        content,
        preview: preview || "",
        tags: tags || [],
        published: published || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email
        }
      };
      
      const newPostRef = await firestore.collection("posts").add(postData);
      
      return res.status(201).json({
        id: newPostRef.id,
        ...postData,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
