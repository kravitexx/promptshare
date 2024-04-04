import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  codeSnippet: z.string().optional(), // Add a field for the code snippet, make it optional
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  // If you want users to be able to post code snippets in comments as well, add it here too
  codeSnippet: z.string().optional(),
});
