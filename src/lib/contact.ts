const topicMap: Record<string, string> = {
  business: "Business banking",
  loans: "Loans",
  security: "Security concern",
  careers: "Careers",
  newsroom: "Media inquiry",
  rates: "Rates inquiry",
};

export function mapContactTopic(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return topicMap[value.toLowerCase()] ?? value;
}
