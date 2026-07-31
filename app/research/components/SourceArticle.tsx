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

const optimizeArticleImages = (html: string) => {
  let imageIndex = 0;

  return html.replace(/<img\b([^>]*)>/gi, (_match, attributes: string) => {
    const isFirstImage = imageIndex === 0;
    imageIndex += 1;

    let optimizedAttributes = attributes
      .replace(/\sloading=("[^"]*"|'[^']*')/gi, "")
      .replace(/\sdecoding=("[^"]*"|'[^']*')/gi, "")
      .replace(/\sfetchpriority=("[^"]*"|'[^']*')/gi, "");

    if (!/\salt\s*=/i.test(optimizedAttributes)) {
      optimizedAttributes += ' alt=""';
    }

    const styleMatch = optimizedAttributes.match(/\sstyle=(?:"([^"]*)"|'([^']*)')/i);
    const style = styleMatch?.[1] ?? styleMatch?.[2] ?? "";
    const widthInches = style.match(/(?:^|;)\s*width\s*:\s*([\d.]+)in/i)?.[1];
    const heightInches = style.match(/(?:^|;)\s*height\s*:\s*([\d.]+)in/i)?.[1];

    if (
      widthInches
      && heightInches
      && !/\swidth\s*=/i.test(optimizedAttributes)
      && !/\sheight\s*=/i.test(optimizedAttributes)
    ) {
      optimizedAttributes += ` width="${Math.round(Number(widthInches) * 96)}" height="${Math.round(Number(heightInches) * 96)}"`;
    }

    return `<img${optimizedAttributes} loading="${isFirstImage ? "eager" : "lazy"}" decoding="async" fetchpriority="${isFirstImage ? "high" : "low"}">`;
  });
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
  const optimizedArticleHtml = optimizeArticleImages(articleHtml);

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <span>Eric Wang</span>
        </Link>
        <nav aria-label="Article navigation">
          {deckHref ? <Link href={deckHref}>Visual deck ↗</Link> : null}
          <Link href="/#research">← Research</Link>
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
          <p>Reading map</p>
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
            <strong>Source edition</strong>
            <p>The original source document is presented as a web article and is not published as a downloadable DOCX.</p>
          </div>
        </aside>

        <article className={styles.body} dangerouslySetInnerHTML={{ __html: optimizedArticleHtml }} />
      </section>

      <footer className={styles.footer}>
        <p>Original research by Eric Wang</p>
        <div>
          <a href="mailto:wangyidong020321@gmail.com">Email ↗</a>
          <Link href="/#research">More research ↗</Link>
        </div>
      </footer>
    </main>
  );
}
