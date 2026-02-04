"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoIosLogOut } from "react-icons/io";
function Navbar({ user }) {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div>
      <div className="flex justify-between items-center border border-amber-200 h-20 px-20 bg-amber-100 hover:bg-amber-200 duration-300 shadow-xl backdrop-blur-2xl">
        <h1 className="text-2xl">Welcome {user}</h1>
        <div className="flex items-center justify-center gap-2">
          <button className="rounded-xl border border-black px-2 py-2 text-white bg-black font-semibold">
            <Link href="#">Admin</Link>
          </button>

          <IoIosLogOut
            size={30}
            alt="logout"
            className="hover:scale-110 transition-all"
            onClick={handleLogout}
          />

        </div>
      </div>
    </div>
  );
}
export default Navbar;
