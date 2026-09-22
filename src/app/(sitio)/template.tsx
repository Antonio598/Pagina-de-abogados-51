// Transición de página: fundido de 200 ms con CSS (funciona sin JavaScript
// y se desactiva con prefers-reduced-motion en globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[page-in_220ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none">{children}</div>;
}
