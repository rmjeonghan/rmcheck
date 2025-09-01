// src/components/MyPageHeader.tsx
"use client";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const MyPageHeader = () => {
  return (
    <header className="bg-white p-4 shadow-sm flex items-center">
      <Link href="/" className="p-2 rounded-full hover:bg-slate-100">
        <ChevronLeft className="w-6 h-6 text-slate-600" />
      </Link>
      <h1 className="text-xl font-bold ml-2">마이 리포트</h1>
    </header>
  );
};
export default MyPageHeader;