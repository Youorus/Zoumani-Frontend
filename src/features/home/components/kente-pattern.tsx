export function KentePattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute top-20 right-[-3.5rem] z-10 hidden h-[560px] w-[220px] rotate-[7deg] opacity-55 lg:block"
      viewBox="0 0 220 620"
      fill="none"
    >
      <defs>
        <pattern id="zoumani-kente" width="84" height="84" patternUnits="userSpaceOnUse">
          <path d="M42 3 81 42 42 81 3 42 42 3Z" stroke="currentColor" strokeWidth="8" />
          <path
            d="M42 20 64 42 42 64 20 42 42 20Z"
            stroke="currentColor"
            strokeWidth="5"
          />
          <path d="M0 0h18v18H0zM66 66h18v18H66z" fill="currentColor" />
          <path d="M64 0 84 20M0 64l20 20" stroke="currentColor" strokeWidth="5" />
        </pattern>
        <linearGradient id="kente-fade" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--secondary)" />
          <stop offset="0.52" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--inverse-foreground)" />
        </linearGradient>
        <mask id="kente-mask">
          <rect width="220" height="620" fill="url(#kente-fade)" />
        </mask>
      </defs>
      <rect
        width="220"
        height="620"
        fill="url(#zoumani-kente)"
        color="var(--primary)"
        mask="url(#kente-mask)"
      />
    </svg>
  );
}
