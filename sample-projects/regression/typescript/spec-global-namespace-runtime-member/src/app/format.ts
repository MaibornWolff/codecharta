export function sortNames(names: string[]): string[] {
  const collator = new Intl.Collator();
  return names.sort(collator.compare);
}

export function duration(): string {
  return new Intl.DurationFormat().format({});
}
