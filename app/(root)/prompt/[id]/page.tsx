import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import PromptCard from "@/components/cards/PromptCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchPromptById } from "@/lib/actions/prompt.actions";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const prompt = await fetchPromptById(params.id);

  return (
    <section className='relative'>
      <div>
        <PromptCard
          id={prompt._id}
          currentUserId={user.id}
          parentId={prompt.parentId}
          content={prompt.text}
          code={prompt.code} // Add this line to pass the code snippet
          imageUrl={prompt.imageUrl} // Pass the imageUrl to the PromptCard component
          author={prompt.author}
          community={prompt.community}
          createdAt={prompt.createdAt}
          comments={prompt.children}
        />
      </div>

      <div className='mt-7'>
        <Comment
          promptId={params.id}
          currentUserImg={user.imageUrl}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className='mt-10'>
        {prompt.children.map((childItem: any) => (
          <PromptCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default page;
