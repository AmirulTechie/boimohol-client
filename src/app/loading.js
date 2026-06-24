export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f5eb] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#008854]/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#008854] animate-spin" />
      </div>
      <span className="font-dance text-lg text-[#008854] font-bold tracking-wide">Boimohol</span>
    </div>
  );
}