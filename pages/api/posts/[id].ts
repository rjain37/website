import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  // GET request - fetch a single post
  if (req.method === "GET") {
    try {
      const postDoc = await firestore.collection("posts").doc(id as string).get();
      
      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      const postData = postDoc.data();
      
      // Check if the post is published or the user is authenticated
      if (!postData?.published && !session) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      return res.status(200).json({
        id: postDoc.id,
        ...postData,
        createdAt: postData?.createdAt?.toDate().toISOString() || null,
        updatedAt: postData?.updatedAt?.toDate().toISOString() || null,
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      return res.status(500).json({ error: "Failed to fetch post" });
    }
  } 
  // PUT request - update a post (requires authentication)
  else if (req.method === "PUT") {
    try {
      // Check authentication
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { title, slug, content, preview, tags, published } = req.body;
      
      // Validate required fields
      if (!title || !slug || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if post exists
      const postDoc = await firestore.collection("posts").doc(id as string).get();
      
      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Check if slug already exists (for a different post)
      if (slug !== postDoc.data()?.slug) {
        const existingPost = await firestore
          .collection("posts")
          .where("slug", "==", slug)
          .get();
        
        if (!existingPost.empty) {
          return res.status(409).json({ error: "Slug already exists" });
        }
      }
      
      // Update the post
      const postData = {
        title,
        slug,
        content,
        preview: preview || "",
        tags: tags || [],
        published: published || false,
        updatedAt: new Date(),
      };
      
      await firestore.collection("posts").doc(id as string).update(postData);
      
      return res.status(200).json({
        id,
        ...postData,
        ...postDoc.data(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating post:", error);
      return res.status(500).json({ error: "Failed to update post" });
    }
  } 
  // DELETE request - delete a post (requires authentication)
  else if (req.method === "DELETE") {
    try {
      // Check authentication
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if post exists
      const postDoc = await firestore.collection("posts").doc(id as string).get();
      
      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Delete the post
      await firestore.collection("posts").doc(id as string).delete();
      
      return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ error: "Failed to delete post" });
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
