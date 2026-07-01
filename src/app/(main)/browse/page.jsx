import BrowseClient from "./BrowseClient";
import { GetBrowseBooks } from "@/lib/actions/books";

export default async function BrowsePage() {
  const data = await GetBrowseBooks({ page: 1, limit: 10 });

  return (
    <BrowseClient
      initialBooks={data.books}
      initialTotal={data.total}
      initialTotalPages={data.totalPages}
    />
  );
}