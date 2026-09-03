import { DomainWord } from "../../../model/codeCharta.model"

export function matchingWords(words: DomainWord[], query: string): DomainWord[] {
    const normalizedQuery = query.trim().toLowerCase()
    return words.filter(({ text }) => text.toLowerCase().includes(normalizedQuery))
}
