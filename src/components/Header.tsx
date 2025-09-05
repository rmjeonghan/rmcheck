// src/components/Header.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import toast from "react-hot-toast";
// Image import는 더 이상 필요 없으므로 삭제합니다.

const Header = () => {
  const { user } = useAuth();
  
  // 블로그 URL과 로고 데이터는 Footer.tsx로 이동했으므로 삭제합니다.

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
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* --- 📍 블로그 링크는 삭제되었습니다 --- */}
        
        {/* 마이페이지 링크 */}
        <Link href="/my-page" passHref>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-2 rounded-full hover:bg-slate-100 cursor-pointer"
            title="마이페이지"
          >
            <UserCircle2 className="w-7 h-7 text-slate-600 mr-1" />
            <span className="text-base font-semibold text-slate-600 hidden sm:inline">마이페이지</span>
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