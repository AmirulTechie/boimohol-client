// components/shared/BookCard.jsx
import Image from "next/image";
import Link from "next/link";

export default function BookCard({ book }) {
  function toSlug(title, author) {
  return `${title}-by-${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")  // replace anything non-alphanumeric with -
    .replace(/^-|-$/g, "");        // trim leading/trailing dashes
}

  const { title, author, category, coverImage, deliveryFee, status, _id } = book;
  const href = title && author ? `/browse/${toSlug(title, author)}` : "#";

  return (
    <Link
      href={href}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full w-full"
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-2/3 bg-white p-3 shrink-0 overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-[#008854] text-white text-[10px] font-semibold px-2 py-1 rounded-full z-10">
          {category}
        </span>

        {/* Status badge — only if not Published */}
        {status !== "Published" && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-semibold px-2 py-1 rounded-full z-10">
            {status}
          </span>
        )}

        {/* View Details overlay — slides up from bottom of image on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#008854] text-white text-xs font-semibold text-center py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-10">
          View Details
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-3" />

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{author}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#008854] font-bold text-sm">৳{deliveryFee}</span>
          <span className="text-[10px] text-gray-400">Delivery fee</span>
        </div>
      </div>
    </Link>
  );
}