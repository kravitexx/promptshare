import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import PromptCard from "../cards/PromptCard";

interface Result {
  name: string;
  image: string;
  id: string;
  prompts: {
    _id: string;
    text: string;
    code: string;
    imageUrl: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function PromptsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.prompts.map((prompt) => (
        <PromptCard
          key={prompt._id}
          id={prompt._id}
          currentUserId={currentUserId}
          parentId={prompt.parentId}
          content={prompt.text}
          code={prompt.code} // Add this line to pass the code snippet
          imageUrl={prompt.imageUrl}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: prompt.author.name,
                  image: prompt.author.image,
                  id: prompt.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : prompt.community
          }
          createdAt={prompt.createdAt}
          comments={prompt.children}
        />
      ))}
    </section>
  );
}

export default PromptsTab;
