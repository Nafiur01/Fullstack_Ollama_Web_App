"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../loading";
import { api } from "../lib/api";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", data.username);
      formData.append("password", data.password);
      console.log(data.username);
      console.log(data.password);

      const res = await api.post("/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      <Loading />;
      localStorage.setItem("token", res.data.access_token);
      router.push("/chat");
    } catch (e) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      <h1 className="text-2xl font-bold mb-10">
        Are you ready to chat with Ollama Model?
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-max gap-4"
        action=""
      >
        <input
          placeholder="username"
          {...register("username")}
          className="border-2 p-2 border-gray-300 rounded-xl placeholder-gray-300"
        />
        <input
          type="password"
          placeholder="password"
          {...register("password")}
          className="border-2 p-2 border-gray-300 rounded-xl placeholder-gray-300"
        />
        <div className="flex items-center justify-center">
          <button className="text-white bg-black rounded-md px-6 py-2 w-max flex hover:scale-110 transition-all">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
