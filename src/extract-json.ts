export function extractJSON(text: string) {
  const trimmedText = text.trim();
  const json = trimmedText.startsWith('```')
    ? trimmedText.split(/```(?:json)?/)[1]
    : trimmedText;

  return json;
}
