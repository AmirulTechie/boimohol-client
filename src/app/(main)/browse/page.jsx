import BrowseClient from "./BrowseClient";
import { GetAllBooks } from "@/lib/actions/books";

export default async function BrowsePage() {
  const books = await GetAllBooks();
  return <BrowseClient books={books} />;
}