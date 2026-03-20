/**
 * SVG Donut chart — renders cleanly in both browser and PDF via html2pdf.
 * Props:
 *   segments: [{ label, value, color }]
 *   size:     SVG width/height (default 200)
 *   thickness: stroke width as fraction of radius (default 0.45)
 */
export default function DonutChart({ segments, size = 200, thickness = 0.45 }) {
  const cx     = size / 2
  const cy     = size / 2
  const r      = size / 2 * 0.7
  const stroke = r * thickness

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null

  // Build arc paths
  let cumAngle = -Math.PI / 2 // start at top
  const arcs   = segments.map(seg => {
    const angle    = (seg.value / total) * 2 * Math.PI
    const x1       = cx + r * Math.cos(cumAngle)
    const y1       = cy + r * Math.sin(cumAngle)
    cumAngle      += angle
    const x2       = cx + r * Math.cos(cumAngle)
    const y2       = cy + r * Math.sin(cumAngle)
    const large    = angle > Math.PI ? 1 : 0
    return { ...seg, x1, y1, x2, y2, large }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={`M ${arc.x1} ${arc.y1} A ${r} ${r} 0 ${arc.large} 1 ${arc.x2} ${arc.y2}`}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeLinecap="butt"
        />
      ))}
      {/* Center hole overlay (white) */}
      <circle cx={cx} cy={cy} r={r - stroke / 2} fill="white" />
    </svg>
  )
}
