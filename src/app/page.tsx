"use client";
import { useState } from "react";
import { create } from "./actions";
import { useQuery } from "react-query";
import { RunType, MathResponse } from "@/openai";
import Image from "next/image";
import { InfinitySpin } from "react-loader-spinner";

export default function Home() {
  const [threadId, setThreadId] = useState<string | null>();
  const [jobData, setJobData] = useState<{ runId: string, threadId: string } | null>();
  const [runStatus, setRunStatus] = useState<string | null>();
  const [loading, setLoading] = useState(false);
  const [finalData, setFinalData] = useState<MathResponse | null>();

  async function createAC(formData: FormData) {
    setFinalData(null);
    setLoading(true);
    const { threadId, runId } = await create(formData);
    setJobData({ threadId, runId });
    setThreadId(threadId);
  }

  useQuery<RunType>(
    "queryJobStatus",
    async () => {
      const req = await fetch(
        `/api/mathpix?runId=${jobData?.runId}&threadId=${jobData?.threadId}`,
        {},
      );
      return await req.json();
    },
    {
      enabled: !!jobData,
      refetchInterval: 5000,
      onSuccess: async (data) => {
        if (data.status === "completed") {
          setJobData(null);
          setRunStatus("completed");
        }
      },
    },
  );

  useQuery<MathResponse>(
    "queryFinalData",
    async () => {
      const req = await fetch(`/api/mathpix/${threadId}`, {
        method: "POST",
      });
      return await req.json();
    },
    {
      enabled: !!runStatus,
      onSuccess: async (resData) => {
        setRunStatus(null);
        setLoading(false);
        setFinalData(resData);
      },
    },
  );

  const replaceRedunt = (a: string) => {
    return a.replaceAll("\\", "");
  };

  return (
    <main>
      <div>
        <form className="flex justify-center items-center" action={createAC}>
          <div className="mr-4">
            <label htmlFor="prompt" className="text-sm font-semibold text-gray-600">
              Prompt:
            </label>
            <input
              type="text"
              id="prompt"
              name="prompt"
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 w-96"
            />
          </div>

          <div className="mr-4">
            <label htmlFor="file" className="text-sm font-semibold text-gray-600">
              File:
            </label>
            <input
              id="file"
              type="file"
              name="file"
              required
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mr-4">
            <input className="mr-2 leading-tight" type="checkbox" name="interpreter" />
            <span className="text-sm">Use code interpreter</span>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:shadow-outline-blue"
            disabled={loading}
          >
            Submit
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center w-100 ">
          <InfinitySpin width="400" color="rgb(37 99 235)" />
        </div>
      )}
      {finalData && (
        <div className="flex items-center justify-around mt-12">
          <div className="flex flex-col">
            {finalData.savedImages.map((imageName, idx) => {
              return (
                <Image
                  src={`/${imageName}`}
                  alt="grapth"
                  width="600"
                  height="600"
                  key={`${imageName}-${idx}`}
                />
              );
            })}
          </div>

          <div className="max-w-2xl text-justify">
            {finalData.textArray.reverse().map((text, idx) => {
              return (
                <p className="mb-4" style={{ whiteSpace: "pre-wrap" }} key={`${idx}`}>
                  {replaceRedunt(text)}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
