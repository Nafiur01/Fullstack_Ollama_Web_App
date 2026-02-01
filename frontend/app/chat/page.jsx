"use client";
import { useState } from "react";
import { api } from "../lib/api";

const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX;

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [credit, setCredit] = useState("");

  const sendPrompt = async () => {
    const bearerToken = localStorage.getItem("token");
    const config = {
      method: "POST",
      headers: {Authorization: `Bearer ${bearerToken}`},
      "Content-Type": "application/json"
    };

    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(
        `${API_PREFIX}/generate?prompt=${encodeURIComponent(prompt)}`,
        config
      );
      if (!res.body) throw new Error("No Response Body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while(true){
        const {value,done} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream:true});

        // split by new line 
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines){
          if(!line.trim()) continue;

          const data = JSON.parse(line);
          if (data.type === "meta"){
            setUser(data.user);
            setCredit(data.remaining_credits);
          }else if(data.type === "chunk"){
            setResponse((prev) => prev + data.response);
          }else if(data.type === "end"){
            setLoading(false);
          }
        }
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setResponse("💔 " + "error occured");
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-screen w-max mx-auto justify-center items-center">
      {response ? <h1>You are <strong>{user}</strong> and your remaining credit is: <strong>{credit}</strong></h1> : null}
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
