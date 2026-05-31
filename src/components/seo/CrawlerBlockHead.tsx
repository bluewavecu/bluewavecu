import { crawlerBlockMetaContent } from "@/lib/siteMetadata";

const googleBotAgents = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Google-Extended",
  "Google-InspectionTool",
  "GoogleOther",
  "GoogleProducer",
  "Storebot-Google",
  "AdsBot-Google",
  "AdsBot-Google-Mobile",
  "Mediapartners-Google",
  "APIs-Google",
  "FeedFetcher-Google",
  "DuplexWeb-Google",
] as const;

export function CrawlerBlockHead() {
  return (
    <>
      <meta name="robots" content={crawlerBlockMetaContent} />
      {googleBotAgents.map((agent) => (
        <meta key={agent} name={agent} content={crawlerBlockMetaContent} />
      ))}
    </>
  );
}
