// src/components/MyReportTabs.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MyReportTabsProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const MyReportTabs: React.FC<MyReportTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="relative z-10 flex border-b border-gray-200 bg-white rounded-t-2xl overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex-shrink-0 py-3 px-6 md:px-8 text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out
            ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`
          }
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          {tab.icon}
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="my-report-tab-underline"
              className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default MyReportTabs;