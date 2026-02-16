export default function PageCard({ children, className = "" }) {
  return (
    <section
      className={[
        "rounded-[22px] bg-white border border-black/10",
        "shadow-[0px_10px_24px_rgba(0,0,0,0.10)]",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}
