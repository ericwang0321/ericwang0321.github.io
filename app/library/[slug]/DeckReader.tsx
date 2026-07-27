"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ResearchDeck } from "../decks";
import { deckPageSource } from "../decks";
import styles from "./viewer.module.css";

export default function DeckReader({ deck }: { deck: ResearchDeck }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pages = Array.from({ length: deck.pages }, (_, index) => index + 1);

  useEffect(() => {
    const elements = Array.from({ length: deck.pages }, (_, index) => index + 1)
      .map((page) => document.getElementById(`page-${page}`))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const page = Number((visible.target as HTMLElement).dataset.page);
        if (page) setCurrentPage(page);
      },
      { rootMargin: "-18% 0px -48%", threshold: [0.08, 0.35, 0.7] },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [deck.pages]);

  const goToPage = (page: number) => {
    document.getElementById(`page-${page}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className={styles.reader}
      aria-label={`${deck.title} web reader`}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className={styles.readerBar}>
        <div>
          <span>VIEW-ONLY WEB EDITION</span>
          <strong>{String(currentPage).padStart(2, "0")} / {String(deck.pages).padStart(2, "0")}</strong>
        </div>
        <div className={styles.readerControls}>
          <button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} aria-label="Previous page">↑</button>
          <button type="button" disabled={currentPage === deck.pages} onClick={() => goToPage(currentPage + 1)} aria-label="Next page">↓</button>
        </div>
      </div>

      <div className={styles.pages}>
        {pages.map((page) => (
          <figure id={`page-${page}`} data-page={page} className={styles.page} key={page}>
            <Image
              src={deckPageSource(deck, page)}
              alt={`${deck.title}, page ${page} of ${deck.pages}`}
              width="1536"
              height="864"
              loading={page === 1 ? "eager" : "lazy"}
              fetchPriority={page === 1 ? "high" : "auto"}
              decoding="async"
              draggable="false"
              unoptimized
            />
            <figcaption>PAGE {String(page).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
