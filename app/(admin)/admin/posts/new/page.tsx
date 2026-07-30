import type { Metadata } from "next"

import { EMPTY_POST_FORM, PostForm } from "@/components/admin/PostForm"
import { createPost } from "@/lib/posts/actions"

export const metadata: Metadata = {
  title: "新增文章",
  robots: { index: false, follow: false },
}

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">新增文章</h1>

      <PostForm
        action={createPost}
        initial={EMPTY_POST_FORM}
        submitLabel="建立"
        autoSlug
      />
    </div>
  )
}
