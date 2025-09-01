// src/components/Header.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import toast from "react-hot-toast";

const Header = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("로그아웃 되었습니다.");
    } catch (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between p-4 bg-white shadow-sm"
    >
      <div className="flex flex-col">
        <span className="text-sm text-slate-500">환영합니다!</span>
        <h1 className="text-xl font-bold text-slate-800">
          {user?.displayName || "학습자"}님
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/my-page" passHref>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-slate-100 cursor-pointer"
            title="마이페이지"
          >
            <UserCircle2 className="w-7 h-7 text-slate-600" />
          </motion.div>
        </Link>
        {/* 임시 로그아웃 버튼 */}
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
          로그아웃
        </button>
      </div>
    </motion.header>
  );
};

export default Header;