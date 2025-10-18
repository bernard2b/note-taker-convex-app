import { useState, useRef, useEffect } from "react";

type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;
  minSplit?: number;
  maxSplit?: number;
};

export function SplitLayout({
  left,
  right,
  defaultSplit = 60,
  minSplit = 30,
  maxSplit = 80,
}: SplitLayoutProps) {
  const [splitPercent, setSplitPercent] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedPercent = Math.max(minSplit, Math.min(maxSplit, percent));
      setSplitPercent(clampedPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minSplit, maxSplit]);

  return (
    <>
      {/* Desktop Layout - Resizable Split */}
      <div
        ref={containerRef}
        className="hidden lg:flex h-full relative select-none"
      >
        {/* Left Panel */}
        <div
          className="h-full overflow-auto"
          style={{ width: `${splitPercent}%` }}
        >
          {left}
        </div>

        {/* Resizable Divider */}
        <div
          className={`w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group ${
            isDragging ? "bg-blue-500" : ""
          }`}
          onMouseDown={() => setIsDragging(true)}
        >
          {/* Drag Handle - visible on hover */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-gray-400 group-hover:bg-blue-500 rounded-full p-1.5">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className="h-full overflow-auto"
          style={{ width: `${100 - splitPercent}%` }}
        >
          {right}
        </div>
      </div>

      {/* Tablet/Mobile Layout - Stacked */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Left Panel (Top on mobile) */}
        <div className="flex-1 overflow-auto border-b border-gray-200">
          {left}
        </div>

        {/* Right Panel (Bottom on mobile) */}
        <div className="flex-1 overflow-auto">{right}</div>
      </div>
    </>
  );
}

