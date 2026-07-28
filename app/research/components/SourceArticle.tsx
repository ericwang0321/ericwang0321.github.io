import Link from "next/link";
import styles from "./source-article.module.css";

export type ArticleTocItem = {
  label: string;
  number: string;
  href: string;
};

type SourceArticleProps = {
  title: string;
  subtitle?: string;
  kicker: string;
  metadata?: string;
  sourceNote?: string;
  articleHtml: string;
  toc: ArticleTocItem[];
  deckHref?: string;
};

export default function SourceArticle({
  title,
  subtitle,
  kicker,
  metadata,
  sourceNote,
  articleHtml,
  toc,
  deckHref,
}: SourceArticleProps) {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <strong>EW</strong>
          <span>Eric Wang</span>
        </Link>
        <nav aria-label="Article navigation">
          {deckHref ? <Link href={deckHref}>VISUAL DECK ↗</Link> : null}
          <Link href="/#research">← RESEARCH</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>{kicker}</p>
        <h1>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <div className={styles.sourceLine}>
          {sourceNote ? <p>{sourceNote}</p> : null}
          {metadata ? <p>{metadata}</p> : null}
        </div>
      </section>

      <section className={styles.articleLayout}>
        <aside className={styles.toc}>
          <p>READING MAP</p>
          <ol>
            {toc.map((item) => (
              <li key={`${item.number}-${item.href}`}>
                <a href={item.href}>
                  <span>{item.number}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
          <div>
            <strong>SOURCE EDITION</strong>
            <p>The original source document is presented as a web article and is not published as a downloadable DOCX.</p>
          </div>
        </aside>

        <article className={styles.body} dangerouslySetInnerHTML={{ __html: articleHtml }} />
      </section>

      <footer className={styles.footer}>
        <p>Original research by Eric Wang · 王逸东</p>
        <div>
          <a href="mailto:wangyidong020321@gmail.com">EMAIL ↗</a>
          <Link href="/#research">MORE RESEARCH ↗</Link>
        </div>
      </footer>
    </main>
  );
}
