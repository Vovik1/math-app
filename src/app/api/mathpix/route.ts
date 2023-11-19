import { NextRequest, NextResponse } from "next/server";
import { getRunStatus } from "@/openai";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const runId = searchParams.get("runId") as string;
  const threadId = searchParams.get("threadId") as string;
  const ret = await getRunStatus(threadId, runId);
  return NextResponse.json(ret);
}
