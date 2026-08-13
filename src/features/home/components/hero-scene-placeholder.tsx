export function HeroScenePlaceholder() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute top-[19%] right-[12%] size-[23rem] rounded-full bg-secondary/18 blur-3xl" />
      <svg
        className="absolute right-[9%] bottom-[21%] w-[56rem] max-w-[68vw] text-inverse-foreground/10"
        viewBox="0 0 900 280"
        fill="currentColor"
      >
        <path d="M34 180h598l151-62h73l-90 73 78 19v18l-85-3-66 37h-55l31-42H325l-66 40h-56l30-40H34c-42 0-42-40 0-40Z" />
      </svg>
      <div className="absolute right-[-6%] bottom-[8%] h-36 w-[78%] -rotate-3 rounded-[50%] bg-inverse-surface/55 blur-sm" />
    </div>
  );
}
