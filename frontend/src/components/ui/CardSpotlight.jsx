import { useState } from "react";

export default function CardSpotlight({ children, className = "", ...props }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    setMouseX(clientX - left);
    setMouseY(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-all duration-300 group/spotlight ${className}`}
      {...props}
    >
      {/* Subtle base grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0] dark:opacity-[0] transition-opacity duration-300"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          color: "rgb(148, 163, 184)",
        }}
      />

      {/* Spotlight radial glow */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 ${
          isHovered ? "opacity-20" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(37, 146, 234, 0.12), transparent 20%)`,
        }}
      />

      {/* Glowing grid reveal under mouse */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          isHovered ? "opacity-40" : "opacity-0"
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          color: "#2592ea",
          maskImage: `radial-gradient(160px circle at ${mouseX}px ${mouseY}px, black 5%, transparent 50%)`,
          WebkitMaskImage: `radial-gradient(160px circle at ${mouseX}px ${mouseY}px, black 5%, transparent 50%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
