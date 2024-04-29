"use client";
import { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUploadThing } from "@/lib/uploadthing"; // Import the hook from your uploadthing.ts
import { PromptValidation } from "@/lib/validations/prompt";
import { createPrompt } from "@/lib/actions/prompt.actions";

interface Props {
  userId: string;
}

// Extend the existing PromptValidation to include a codeSnippet field
const PromptWithCodeValidation = PromptValidation.extend({
  codeSnippet: z.string().optional(),
  imageUrl: z.string().optional(), // Add a field for the image URL
});

function PostPrompt({ userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { organization } = useOrganization();
  const { startUpload } = useUploadThing("media"); // Use the "media" endpoint as defined in core.ts
  const [files, setFiles] = useState<File[]>([]); // State to store the selected files
  

  const form = useForm<z.infer<typeof PromptWithCodeValidation>>({
    resolver: zodResolver(PromptWithCodeValidation),
    defaultValues: {
      prompt: "",
      codeSnippet: "", // Add a default value for the code snippet
      imageUrl: "", // Default value for the image URL
      accountId: userId,
    },
  });
 
  // eslint-disable-next-line no-undef
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles([file]); // Set the files state
    }
  };

  const onSubmit = async (values: z.infer<typeof PromptWithCodeValidation>) => {
    let imageUrl = values.imageUrl;

    if (files.length > 0) {
      const uploadResults = await startUpload(files);
      if (uploadResults && uploadResults.length > 0) {
        imageUrl = uploadResults[0].fileUrl;
      } else {
        // Handle the case where the image upload failed
        console.error('Image upload failed');
        // Optionally, set an error state and return to prevent form submission
        return;
      }
    }
    await createPrompt({
      text: values.prompt,
      code: values.codeSnippet, // Include the code snippet in the data sent to the server
      imageUrl, // Include the image URL in the data sent to the server
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push("/");
  };
  return (
    <Form {...form}>
      <form
        className='mt-10 flex flex-col justify-start gap-10'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='prompt'
          render={({ field}) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Content
              </FormLabel>
              <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <Textarea rows={10} {...field} 
                placeholder="Write the Title or Explaination of the Prompt" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {/* New FormField for the code snippet */}
         <FormField
          control={form.control}
          name='codeSnippet'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Write the Prompt Below:
              </FormLabel>
              <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <Textarea rows={10} {...field} className="prompt-content" placeholder="Prompt" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
   {/* New FormField for image upload */}
   <FormField
          control={form.control}
          name='imageUrl'
          render={() => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Upload Image or Drag and Drop (Max 4MB)
              </FormLabel>
              <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-primary-500'>
          Post Prompt
        </Button>
      </form>
    </Form>
  );
}

export default PostPrompt;
