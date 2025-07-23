export default function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0b0e1a]">
      <div className="relative w-16 h-16">
        <div className="absolute border-4 border-purple-500 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
        <div className="absolute border-4 border-purple-300 border-t-transparent rounded-full w-12 h-12 top-2 left-2 animate-spin-slow"></div>
      </div>
    </div>
  );
}
