import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeckReader from "./DeckReader";
import styles from "./viewer.module.css";
import { deckPageSource, researchDecks } from "../decks";

export function generateStaticParams() {
  return researchDecks.map((deck) => ({ slug: deck.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const deck = researchDecks.find((item) => item.slug === slug);
  if (!deck) return {};
  return {
    title: `${deck.title} — Eric Wang`,
    description: deck.summary,
    openGraph: {
      title: deck.title,
      description: deck.summary,
      images: [{ url: deckPageSource(deck, 1), width: 1536, height: 864 }],
    },
  };
}

export default async function LibraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deck = researchDecks.find((item) => item.slug === slug);
  if (!deck) notFound();

  return (
    <main className={`${styles.shell} ${styles[deck.accent]}`}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <span>Eric Wang</span>
        </Link>
        <Link href="/#research">← Back to research</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}><span>{deck.category}</span><i /><span>2026</span></div>
          <h1>{deck.title}</h1>
          <h2>{deck.chineseTitle}</h2>
          <p>{deck.summary}</p>
          <dl>
            <div><dt>Format</dt><dd>Visual research deck</dd></div>
            <div><dt>Length</dt><dd>{deck.pages} pages</dd></div>
            <div><dt>Author</dt><dd>Eric Wang</dd></div>
          </dl>
        </div>
        <div className={styles.cover} aria-hidden="true">
          <Image src={deckPageSource(deck, 1)} alt="" width="1536" height="864" priority unoptimized />
        </div>
      </section>

      <div className={styles.notice}>
        <strong>Read in browser</strong>
        <p>The original PDF is not published. This web edition preserves every page for reading without a direct source-file download.</p>
      </div>

      <DeckReader deck={deck} />

      <footer className={styles.footer}>
        <p>Original research and visual synthesis by Eric Wang</p>
        <Link href="/#research">More research ↗</Link>
      </footer>
    </main>
  );
}
