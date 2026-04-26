export function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-primary pl-3 py-1 text-body-sm text-on-surface italic">
      {children}
    </blockquote>
  );
}
