import React, { useEffect, useState } from "react";

const Forum = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const baseURL = "http://localhost:5000";

  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canPost = user && user.role === "student";
  const isCounselor = user && user.role === "counselor";

  const loadPosts = async () => {
    try {
      const res = await fetch(`${baseURL}/api/forum/posts`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch (err) {
      // no-op for framework stage
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!canPost) {
      setError("Please log in as a student to post.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${baseURL}/api/forum/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.userId, title, content, tags: [] })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setTitle("");
        setContent("");
        loadPosts();
      } else {
        setError(data.message || "Failed to create post");
      }
    } catch (err) {
      setLoading(false);
      setError("Server error while creating post");
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!canPost) return;
    if (!content.trim()) return;
    try {
      const res = await fetch(`${baseURL}/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.userId, content })
      });
      const data = await res.json();
      if (data.success) loadPosts();
    } catch {}
  };

  const handleDeletePost = async (postId) => {
    if (!isCounselor) return;
    try {
      const res = await fetch(`${baseURL}/api/forum/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", 'x-user-id': user.userId },
        body: JSON.stringify({ actorId: user.userId })
      });
      const data = await res.json();
      if (data.success) loadPosts();
    } catch {}
  };

  const handleToggleRestriction = async (studentId, currentCanPost) => {
    if (!isCounselor) return;
    try {
      const res = await fetch(`${baseURL}/api/forum/restrict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counselorId: user.userId, studentId, canPost: !currentCanPost })
      });
      const data = await res.json();
      if (data.success) loadPosts();
    } catch {}
  };

  return (
    <div
  className="min-h-screen p-6 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/images/background.jpg')",
  }}
>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Forum</h1>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Post</h2>
          {!canPost && (
            <p className="text-sm text-gray-600 mb-4">Please log in as a student to post.</p>
          )}
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-3 border rounded"
              disabled={!canPost}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or experiences..."
              className="w-full p-3 border rounded min-h-[120px]"
              disabled={!canPost}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!canPost || loading}
              className="px-4 py-2 bg-[#2e8b57] text-white rounded disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p._id} className="bg-white rounded-xl shadow p-5">
              <header className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500">by {p.author?.name || "Student"} • {new Date(p.createdAt).toLocaleString()}</p>
                  {isCounselor && p.author?.role === 'student' && (
                    <div className="mt-1 text-xs">
                      <span className={p.author?.canPost === false ? 'text-red-600' : 'text-green-600'}>
                        {p.author?.canPost === false ? 'Posting restricted' : 'Posting allowed'}
                      </span>
                    </div>
                  )}
                </div>
                {isCounselor && (
                  <div className="flex items-center gap-2">
                    {p.author?._id && p.author?.role === 'student' && (
                      <button
                        onClick={() => handleToggleRestriction(p.author._id, p.author?.canPost !== false)}
                        className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                        title={p.author?.canPost === false ? 'Allow this student to post' : 'Restrict this student from posting'}
                      >
                        {p.author?.canPost === false ? 'Unrestrict' : 'Restrict'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePost(p._id)}
                      className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                      title="Delete post"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </header>
              <p className="text-gray-800 whitespace-pre-line mb-4">{p.content}</p>

              {/* Comments */}
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Comments</h4>
                <div className="space-y-2">
                  {(p.comments || []).map((c) => (
                    <div key={c._id} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="text-gray-700">{c.content}</div>
                      <div className="text-gray-400 text-xs">by {c.author?.name || "Student"} • {new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {canPost && (
                  <CommentComposer onSubmit={(text) => handleAddComment(p._id, text)} />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentComposer = ({ onSubmit }) => {
  const [text, setText] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 p-2 border rounded"
      />
      <button
        type="button"
        onClick={() => { if (text.trim()) { onSubmit(text); setText(""); } }}
        className="px-3 py-2 bg-gray-800 text-white rounded"
      >
        Comment
      </button>
    </div>
  );
};

export default Forum;
