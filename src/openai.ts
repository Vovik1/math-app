import fs from "fs";
import OpenAI from "openai";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type RunType = OpenAI.Beta.Threads.Runs.Run;
export type MathResponse = {
  textArray: string[],
  savedImages: string[],
};

export async function askAssistant(
  userPrompt: string,
  mathFormulaText: string,
  useInterpreter: boolean = false,
) {
  const assistant = useInterpreter
    ? await openai.beta.assistants.create({
        instructions:
          "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
        model: "gpt-4-1106-preview",
        tools: [{ type: "code_interpreter" }],
      })
    : await openai.beta.assistants.create({
        instructions: "You are a personal math tutor.",
        model: "gpt-4-1106-preview",
      });

  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `${mathFormulaText} ${userPrompt}`,
  });
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  return { threadId: thread.id, runId: run.id };
}

export async function getRunStatus(threadId: string, runId: string) {
  const runData = await openai.beta.threads.runs.retrieve(threadId, runId);
  return runData;
}

export async function responseOpenAi(threadId: string) {
  const messages = await openai.beta.threads.messages.list(threadId);
  const textArray: string[] = [];
  const imagesArray: string[] = [];
  const assistantData = messages.data.filter((obj) => obj.role === "assistant");
  for (const data of assistantData) {
    for (const content of data.content) {
      if (content.type === "image_file") {
        const fileId = content.image_file.file_id;
        imagesArray.push(fileId);
      }
      if (content.type === "text") {
        textArray.push(content.text.value);
      }
    }
  }

  const promises =
    process.env.NODE_ENV === "development"
      ? imagesArray.map((image) => saveFile(image))
      : imagesArray.map((image) => saveFileVercelBlob(image));
  const savedImages = await Promise.all(promises);

  return { textArray, savedImages };
}

async function downLoadOpenAIImage(fileId: string) {
  const response = await openai.files.content(fileId);
  const image_data = await response.arrayBuffer();
  const image_data_buffer = Buffer.from(image_data);
  return image_data_buffer;
}

async function saveFile(fileId: string) {
  const image_data_buffer = await downLoadOpenAIImage(fileId);
  const filename = `grapth_${crypto.randomBytes(8).toString("hex")}.png`;
  const destinationDirPath = path.join(process.cwd(), "public");
  if (!existsSync(destinationDirPath)) {
    fs.mkdirSync(destinationDirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(destinationDirPath, filename), image_data_buffer);
  return filename;
}

async function saveFileVercelBlob(fileId: string) {
  const image_data_buffer = await downLoadOpenAIImage(fileId);
  const filename = `grapth_${crypto.randomBytes(8).toString("hex")}.png`;
  const blob = await put(filename, image_data_buffer, {
    access: "public",
  });
  return blob.url;
}
