"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Prompt from "../models/prompt.model";
import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level prompts) (a prompt that is not a comment/reply).
  const postsQuery = Prompt.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (prompts) i.e., prompts that are not comments.
  const totalPostsCount = await Prompt.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string,
  code?: string, // Add an optional code property
  imageUrl?: string, // Include the imageUrl in the Params interface
  author: string,
  communityId: string | null,
  path: string,
}

export async function createPrompt({ text, code, imageUrl, author, communityId, path }: Params
) {
  
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdPrompt = await Prompt.create({
      text,
      code, // This will now be accepted as part of the prompt document
      imageUrl, // Save the imageUrl to the prompt document
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { prompts: createdPrompt._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { prompts: createdPrompt._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create prompt: ${error.message}`);
  }
}

async function fetchAllChildPrompts(promptId: string): Promise<any[]> {
  const childPrompts = await Prompt.find({ parentId: promptId });

  const descendantPrompts = [];
  for (const childPrompt of childPrompts) {
    const descendants = await fetchAllChildPrompts(childPrompt._id);
    descendantPrompts.push(childPrompt, ...descendants);
  }

  return descendantPrompts;
}

export async function deletePrompt(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the prompt to be deleted (the main prompt)
    const mainPrompt = await Prompt.findById(id).populate("author community");

    if (!mainPrompt) {
      throw new Error("Prompt not found");
    }

    // Fetch all child prompts and their descendants recursively
    const descendantPrompts = await fetchAllChildPrompts(id);

    // Get all descendant prompt IDs including the main prompt ID and child prompt IDs
    const descendantPromptIds = [
      id,
      ...descendantPrompts.map((prompt) => prompt._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantPrompts.map((prompt) => prompt.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainPrompt.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantPrompts.map((prompt) => prompt.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainPrompt.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child prompts and their descendants
    await Prompt.deleteMany({ _id: { $in: descendantPromptIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { prompts: { $in: descendantPromptIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { prompts: { $in: descendantPromptIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete prompt: ${error.message}`);
  }
}

export async function fetchPromptById(promptId: string) {
  connectToDB();

  try {
    const prompt = await Prompt.findById(promptId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Prompt, // The model of the nested children (assuming it's the same "Prompt" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return prompt;
  } catch (err) {
    console.error("Error while fetching prompt:", err);
    throw new Error("Unable to fetch prompt");
  }
}

export async function addCommentToPrompt(
  promptId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original prompt by its ID
    const originalPrompt = await Prompt.findById(promptId);

    if (!originalPrompt) {
      throw new Error("Prompt not found");
    }

    // Create the new comment prompt
    const commentPrompt = new Prompt({
      text: commentText,
      author: userId,
      parentId: promptId, // Set the parentId to the original prompt's ID
    });

    // Save the comment prompt to the database
    const savedCommentPrompt = await commentPrompt.save();

    // Add the comment prompt's ID to the original prompt's children array
    originalPrompt.children.push(savedCommentPrompt._id);

    // Save the updated original prompt to the database
    await originalPrompt.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
