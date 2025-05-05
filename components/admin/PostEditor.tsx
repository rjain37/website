import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, serverTimestamp, getDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";
import { useSession } from "next-auth/react";

interface PostEditorProps {
  postId?: string;
  isEditing?: boolean;
}

interface PostData {
  title: string;
  slug: string;
  content: string;
  preview: string;
  tags: string[];
  published: boolean;
  postDate?: string; // Date in ISO format (YYYY-MM-DD)
}

const PostEditor: React.FC<PostEditorProps> = ({ postId, isEditing = false }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PostData>({
    title: "",
    slug: "",
    content: "",
    preview: "",
    tags: [],
    published: false,
    postDate: new Date().toISOString().split('T')[0], // Initialize with current date in YYYY-MM-DD format
  });
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Fetch post data if editing
  useEffect(() => {
    const fetchPost = async () => {
      if (isEditing && postId) {
        try {
          const postRef = doc(db, "posts", postId);
          const postSnap = await getDoc(postRef);
          
          if (postSnap.exists()) {
            const postData = postSnap.data() as PostData;
            setFormData(postData);
          } else {
            setError("Post not found");
          }
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Error loading post data");
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [isEditing, postId]);

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single one
      .trim();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "title") {
      // Auto-generate slug when title changes
      setFormData({
        ...formData,
        title: value,
        slug: generateSlug(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) {
      setError("You must be signed in to save posts");
      return;
    }

    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.title || !formData.content) {
        setError("Title and content are required");
        setSaving(false);
        return;
      }
      
      // Create or update the post
      const postRef = isEditing && postId 
        ? doc(db, "posts", postId) 
        : doc(db, "posts", postId || doc(collection(db, "posts")).id);
      
      // Parse the selected date or default to current date
      const selectedDate = formData.postDate
        ? new Date(formData.postDate)
        : new Date();
      
      // Ensure the date is valid
      const validDate = !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
      
      const postData: any = {
        ...formData,
        updatedAt: serverTimestamp(),
        author: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      };
      
      // Add createdAt only for new posts
      if (!isEditing) {
        // Use the selected date for createdAt instead of current time
        postData.createdAt = validDate;
      }
      
      await setDoc(postRef, postData, { merge: isEditing });
      
      router.push("/admin");
    } catch (err) {
      console.error("Error saving post:", err);
      setError("Error saving post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-dark-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-primary-900 dark:text-primary-400">
        {isEditing ? "Edit Post" : "Create New Post"}
      </h1>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800 dark:text-white"
          />
        </div>

        <div>
          <label 
            htmlFor="slug" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Slug *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-dark-700 dark:text-gray-300">
              /posts/
            </span>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="postDate" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Post Date
          </label>
          <input
            type="date"
            name="postDate"
            id="postDate"
            value={formData.postDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800 dark:text-white"
          />
        </div>

        <div>
          <label 
            htmlFor="preview" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Preview
          </label>
          <textarea
            name="preview"
            id="preview"
            rows={2}
            value={formData.preview}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800 dark:text-white"
            placeholder="A short preview of your post (optional)"
          />
        </div>

        <div>
          <label 
            htmlFor="content" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Content (MDX) *
          </label>
          <textarea
            name="content"
            id="content"
            rows={15}
            value={formData.content}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800 dark:text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800 dark:text-white"
              placeholder="Add tags..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="ml-2 rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center rounded-full bg-primary-100 px-3 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-200 text-primary-600 hover:bg-primary-300 hover:text-primary-700 focus:outline-none dark:bg-primary-800 dark:text-primary-300 dark:hover:bg-primary-700"
                >
                  <span className="sr-only">Remove tag</span>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="published"
            name="published"
            type="checkbox"
            checked={formData.published}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-800"
          />
          <label
            htmlFor="published"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Publish this post
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-dark-700 dark:text-white dark:hover:bg-dark-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
