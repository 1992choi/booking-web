export default function MonthNav({
  year,
  month,
  onPrev,
  onNext,
  className = '',
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={onPrev}
        aria-label="이전 달"
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        ‹
      </button>
      <span className="text-base font-semibold text-gray-800">{year}년 {month}월</span>
      <button
        onClick={onNext}
        aria-label="다음 달"
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        ›
      </button>
    </div>
  );
}
