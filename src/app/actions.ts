"use server";
import { mathpixImageToText } from "@/mathpix";
import { askAssistant } from "@/openai";

export async function create(formData: FormData) {
  const f = formData.get("file");
  const prompt = formData.get("prompt") as string;
  const useInterpreter = formData.get("interpreter") === "on" ? true : false;
  const file = f as File;

  const data = await mathpixImageToText(file);
  const res = await askAssistant(prompt, data.text, useInterpreter);
  return res;
}
