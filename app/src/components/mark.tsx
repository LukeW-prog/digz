/**
 * The Digs mark: a window with the light on in one pane.
 *
 * Digs is a room in a house where someone is already living, so a lit window
 * is the literal thing rather than a metaphor reached for. It also survives
 * being 16 pixels wide, which a house or a key does not.
 *
 * The frame takes currentColor so it inherits from wherever it sits. Only the
 * lit pane is fixed, because that is the brand colour doing its one job.
 */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={className}
      fill="none"
    >
      {/* The lit pane, drawn first so the frame sits over it. */}
      <path d="M4 4h7v7H4z" fill="var(--signal)" />
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 3.75v16.5M3.75 12h16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
