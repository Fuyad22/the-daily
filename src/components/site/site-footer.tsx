export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-10 text-center text-sm text-muted">
      <p className="font-display text-lg text-ink">The Daily</p>
      <p className="mt-2">© {new Date().getFullYear()} The Daily. All rights reserved.</p>
      <p className="mt-2">
        <a href="/rss.xml" className="hover:text-accent">
          RSS
        </a>
      </p>
    </footer>
  );
}
