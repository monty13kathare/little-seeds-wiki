'use client';

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-full overflow-hidden bg-[#030712]">
      {children}
    </div>
  );
}
