export function ListingHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="mb-10 border-b border-line pb-6">
      {eyebrow && <p className="label text-ink">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
    </header>
  );
}
