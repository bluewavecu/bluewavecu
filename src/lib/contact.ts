const topicMap: Record<string, string> = {
  business: "Business banking",
  loans: "Loans",
  security: "Security concern",
  careers: "Careers",
  newsroom: "General inquiry",
  rates: "General inquiry",
};

export function mapContactTopic(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return topicMap[value.toLowerCase()] ?? value;
}
