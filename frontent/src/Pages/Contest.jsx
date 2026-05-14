import React from "react";
import Navbar from "../Components/Navbar";
import { motion } from "framer-motion";

const Contest = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black flex items-center justify-center text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🚀 Contests Coming Soon
          </h1>

          <p className="text-gray-400 max-w-md mx-auto mb-6">
            We’re working hard to bring competitive coding contests for you.
            Stay tuned and keep practicing 💻
          </p>

          <div className="inline-block px-6 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
            ⏳ Under Development
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Contest;
