import { NextRequest, NextResponse } from "next/server";
import { responseOpenAi } from "@/openai";

export async function POST(_request: NextRequest, { params }: { params: { threadId: string } }) {
  const resp = await responseOpenAi(params.threadId);
  return NextResponse.json(resp);
}
