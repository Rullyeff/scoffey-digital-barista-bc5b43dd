export function StudioBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Warm coffee blobs behind the studio card */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />
      <div className="blob blob-4" aria-hidden="true" />
    </div>
  );
}


