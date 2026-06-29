import BannerSection from "@/components/home/Banners";
import PopularCategories from "@/components/home/PopularCategories";
import TopLibrarians from "@/components/home/TopLIbrarians";
import LatestBooks from "@/components/layout/LatestBooks";

export default function HomePage() {
  return (
    <main>
      <BannerSection />
      <LatestBooks/>
      <TopLibrarians/>
      <PopularCategories/>
    </main>
  );
}