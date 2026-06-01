import { GOOGLE_CRAWLER_AGENTS } from "@/lib/crawlerDefense";
import { crawlerBlockMetaContent } from "@/lib/siteMetadata";

export function CrawlerBlockHead() {
  return (
    <>
      <meta name="robots" content={crawlerBlockMetaContent} />
      <meta name="googlebot" content={crawlerBlockMetaContent} />
      <meta name="googlebot-news" content={crawlerBlockMetaContent} />
      <meta name="googlebot-image" content={crawlerBlockMetaContent} />
      <meta name="googlebot-video" content={crawlerBlockMetaContent} />
      {GOOGLE_CRAWLER_AGENTS.map((agent) => (
        <meta key={agent} name={agent} content={crawlerBlockMetaContent} />
      ))}
    </>
  );
}
