type Props = {
  /**
   * Material Symbol identifier (snake_case). Browse the catalog at
   * https://fonts.google.com/icons — every supported icon's "name" works here.
   */
  name: string;
  /** Pixel size; maps to font-size & line-height. Defaults to 20. */
  size?: number;
  /** Filled vs. outlined glyph (uses font-variation-settings). */
  filled?: boolean;
  /** Use rounded variant. */
  rounded?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Renders a Google Material Symbol via the icon font preloaded in app/layout.tsx.
 * Aria-hidden by default because icons are typically decorative; pass aria-label
 * to flag them as meaningful (e.g. icon-only buttons).
 */
export function Icon({
  name,
  size = 20,
  filled = false,
  rounded = false,
  className = "",
  ...rest
}: Props) {
  const labelled = rest["aria-label"] !== undefined;
  return (
    <span
      className={`${rounded ? "material-symbols-rounded" : "material-symbols-outlined"} shrink-0 ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      {...rest}
    >
      {name}
    </span>
  );
}
