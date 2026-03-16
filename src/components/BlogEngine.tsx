"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function BlogEngine() {
  const posts = [
    {
      slug: "living-in-kp2",
      title: "The Ultimate Guide to Living in Knowledge Park 2",
      excerpt: "Everything you need to know about student life near NIET and Galgotias.",
      date: "Mar 15, 2026",
      readTime: "5 min read"
    },
    {
      slug: "avoid-pg-scams",
      title: "How to Avoid PG Scams in Greater Noida",
      excerpt: "Don't lose your security deposit. Learn how to identify verified listings.",
      date: "Mar 12, 2026",
      readTime: "4 min read"
    },
    {
      slug: "top-pgs-niet",
      title: "Top 5 PGs within 500m of NIET Gate 1",
      excerpt: "Short walk, big comfort. Our top picks for NIET students this semester.",
      date: "Mar 10, 2026",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <header className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
            <Sparkles size={14} /> The Community Journal
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">NoidaStay Blog</h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Expert guides and student stories from the heart of Greater Noida.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-12 grid grid-cols-1 gap-10">
        {posts.map((post, i) => (
          <motion.article 
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={12} /> {post.readTime}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="text-slate-500 leading-relaxed font-medium">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest pt-2">
                  Read Article <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </main>
    </div>
  );
}
