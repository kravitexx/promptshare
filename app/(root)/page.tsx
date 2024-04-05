import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import PromptCard from "@/components/cards/PromptCard";
import Pagination from "@/components/shared/Pagination";

import { fetchPosts } from "@/lib/actions/prompt.actions";
import { fetchUser } from "@/lib/actions/user.actions";

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchPosts(
    searchParams.page ? +searchParams.page : 1,
    30
  );

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>

      <section className='mt-9 flex flex-col gap-10'>
        {result.posts.length === 0 ? (
          <p className='no-result'>No prompts found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <PromptCard
                key={post._id}
                id={post._id}
                currentUserId={user.id}
                parentId={post.parentId}
                content={post.text}
                code={post.code} // Add this line to pass the code snippet
                imageUrl={post.imageUrl} // Pass the imageUrl to the PromptCard component
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path='/'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Home;
