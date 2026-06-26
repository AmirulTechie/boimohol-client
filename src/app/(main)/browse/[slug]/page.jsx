import { GetAllBooks } from "@/lib/actions/books";
import { notFound } from "next/navigation";

function toSlug(title, author) {
  return `${title}-by-${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function BookDetailPage({ params }) {
  const params_ = await params;
    const slug = params_.slug;
    console.log("URL slug:", slug);
  const books = await GetAllBooks();
  const book = books.find((b) => toSlug(b.title, b.author) === slug);
     console.log("URL slug:", slug);
  console.log("Generated slugs:", books.map((b) => toSlug(b.title, b.author)));
  if (!book) notFound();

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      {/* rest of your book detail UI */}
    </div>
  );
}