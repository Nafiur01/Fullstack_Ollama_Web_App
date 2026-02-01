"use client";
import Image from "next/image";
import Loading from "./loading";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const login = () => {
    router.push("/login");
  };

  const register = () => {
    router.push("/register");
  }

  return (
    <div className="flex flex-col gap-2 min-h-screen justify-center items-center">
      <h1 className="font-bold text-2xl">Welcome to Ollama Chat App!</h1>
      <Image
        width={200}
        height={20}
        alt="ollama-icon.png"
        src="/ollama-icon.png"
      />
      <div className="flex flex-row w-[200px] justify-between">
        <button
          onClick={login}
          className="border px-5 py-2 rounded-2xl hover:bg-green-400 hover:text-white transition-all duration-300"
        >
          Login
        </button>
        <button onClick={register} className="border px-5 py-2 rounded-2xl hover:bg-blue-400 hover:text-white transition-all duration-300">
          Register
        </button>
      </div>
    </div>
  );
}
