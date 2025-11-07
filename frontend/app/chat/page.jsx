"use client";
import { useState } from "react";
import { api } from "../lib/api";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    const bearerToken = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${bearerToken}` },
    };

    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const response = await api.post(
        `/generate?prompt=${encodeURIComponent(prompt)}`,
        {},
        config
      );
      setResponse(response.data.response);
      console.log(response.data.user);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setResponse("💔 " + err.response.data.detail || "error occured");
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-screen w-max mx-auto justify-center items-center">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
        className="border-2 rounded-md"
      />
      <button
        className="px-2 border-2 rounded-3xl hover:cursor-pointer"
        onClick={sendPrompt}
      >
        Generate
      </button>

      {loading ? (
        <div className="border-2 rounded-md p-4 bg-gray-200 w-[500px]">
          <strong>Generating...</strong>
        </div>
      ) : null}

      {response && (
        <div className="border-2 rounded-md p-4 bg-gray-200 w-[500px]">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
