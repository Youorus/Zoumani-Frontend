import styles from "./about-section.module.css";

const connectionRoutes = [
  "M320 320C240 240 188 170 118 104",
  "M320 320C404 228 470 178 548 132",
  "M320 320C422 344 500 390 574 470",
  "M320 320C274 432 218 496 140 548",
] as const;

const nodes = [
  { x: 118, y: 104 },
  { x: 548, y: 132 },
  { x: 574, y: 470 },
  { x: 140, y: 548 },
] as const;

export function AboutConnectionIllustration() {
  return (
    <svg
      className={styles.connectionIllustration}
      viewBox="0 0 640 640"
      fill="none"
      aria-hidden="true"
      data-about-decoration=""
    >
      <circle className={styles.connectionOrbit} cx="320" cy="320" r="254" />
      <circle className={styles.connectionOrbit} cx="320" cy="320" r="196" />
      <circle className={styles.connectionOrbit} cx="320" cy="320" r="132" />

      <g className={styles.connectionRoutes}>
        {connectionRoutes.map((route, index) => (
          <path key={route} d={route} style={{ animationDelay: `${index * -1.2}s` }} />
        ))}
      </g>

      {nodes.map((node, index) => (
        <g key={`${node.x}-${node.y}`} transform={`translate(${node.x} ${node.y})`}>
          <circle
            className={styles.connectionPulse}
            r="28"
            style={{ animationDelay: `${index * 0.55}s` }}
          />
          <circle className={styles.connectionNode} r="11" />
          <circle className={styles.connectionCore} r="4" />
        </g>
      ))}

      <g className={styles.connectionParcel} transform="translate(320 320)">
        <circle r="47" />
        <path d="M-17-11 0-20l17 9v22L0 20l-17-9v-22Zm0 0L0-2m17-9L0-2m0 22V-2" />
      </g>
    </svg>
  );
}
