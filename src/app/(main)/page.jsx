import BannerSection from "@/components/home/Banners";
import LatestBooks from "@/components/layout/LatestBooks";
import books from "@/data/data.json"

export default function HomePage() {
  return (
    <main>
      <BannerSection />
      <LatestBooks books={books} />
    </main>
  );
}