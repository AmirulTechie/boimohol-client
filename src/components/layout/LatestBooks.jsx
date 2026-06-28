// components/sections/LatestBooks.jsx
"use client";

import { motion } from "motion/react";
import BookCard from "@/components/shared/BookCard";
import { GetAllBooks } from "@/lib/actions/books";
import { useEffect, useState } from "react";

export default function LatestBooks() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      const data = await GetAllBooks();
      setBooks(data);
    };

    loadBooks();
  }, []);

  const latest = books.slice(0, 5);
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">

        {/* Section heading */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-2xl md:text-3xl font-bold text-gray-800"
          >
            Latest Published Books
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="mt-2 h-0.75 w-16 bg-[#008854] rounded-full"
          />
        </div>

        {/* Cards row */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
  {latest.map((book, i) => (
    <motion.div
      key={book._id ?? book.title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.08 }}
      className="flex w-full"
    >
      <BookCard book={book} />
    </motion.div>
  ))}
</div>

      </div>
    </section>
  );
}