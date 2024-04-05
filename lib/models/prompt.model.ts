import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  code: { // Add this new field for the code snippet
    type: String,
    required: false, // Make it optional as not all prompts will have code snippets
  },
  imageUrl: {
    type: String,
    required: false, // Make it optional as not all prompts will have an image
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
    },
  ],
});

const Prompt = mongoose.models.Prompt || mongoose.model("Prompt", promptSchema);

export default Prompt;
