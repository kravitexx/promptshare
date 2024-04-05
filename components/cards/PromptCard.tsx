import Image from "next/image";
import Link from "next/link";

import { formatDateString } from "@/lib/utils";
import DeletePrompt from "../forms/DeletePrompt";
import CopyButton from "../forms/CopyButton";

import AIToolsButton from "../forms/AIToolsButton";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  code?: string;
 imageUrl?: string;
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
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

function PromptCard({
  id,
  currentUserId,
  parentId,
  content,
  code,
 imageUrl,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) {
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
              <Image
                src={author.image}
                alt='user_community_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>

            <div className='prompt-card_bar' />
          </div>

          <div className='flex w-full flex-col'>
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {author.name}
              </h4>
            </Link>

            <p className='mt-2 text-small-regular text-light-2 prompt-content'>{content}</p>
              {/* Conditionally render the "Prompt:" label and the code snippet if 'code' exists */}
      {code && (
        <>
          <div className='mt-2 text-light-2 prompt-content bold-font' >Prompt:</div>
          <pre className='code-snippet my-custom-margin'>{code}</pre>
        </>
      )}
      {/* Display the image if imageUrl is provided */}
      {imageUrl && (
        <div className='mt-4'>
          <Image
            src={imageUrl}
            alt='Prompt Image'
            width={500} // Set desired width
            height={300} // Set desired height
            layout='responsive' // This will maintain the aspect ratio of the image
            className='rounded-lg'
          />
        </div>
      )}

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className='flex gap-3.5'>

                <Link href={`/prompt/${id}`}>
                  <Image
                    src='/assets/reply.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </Link>
               
                <CopyButton  width="140px" height="26px" code={code || ''} />
                <AIToolsButton width="100px" height="26px" />
                
              </div>
              

              {isComment && comments.length > 0 && (
                <Link href={`/prompt/${id}`}>
                  <p className='mt-1 text-subtle-medium text-gray-1'>
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        <DeletePrompt
          promptId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        />
      </div>

      {!isComment && comments.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={comment.author.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}

          <Link href={`/prompt/${id}`}>
            <p className='mt-1 text-subtle-medium text-gray-1'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className='mt-5 flex items-center'
        >
          <p className='text-subtle-medium text-gray-1'>
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className='ml-1 rounded-full object-cover'
          />
        </Link>
      )}
    </article>
  );
}

export default PromptCard;
