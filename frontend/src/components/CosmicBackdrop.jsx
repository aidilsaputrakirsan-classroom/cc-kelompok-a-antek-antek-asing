export default function CosmicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="cosmic-grid" />
      <div className="cosmic-grid-sweep" />

      <div className="stars-layer stars-layer-far" />
      <div className="stars-layer stars-layer-mid" />
      <div className="stars-layer stars-layer-near" />

      <div className="cosmic-nebula cosmic-nebula-left" />
      <div className="cosmic-nebula cosmic-nebula-right" />
    </div>
  );
}
