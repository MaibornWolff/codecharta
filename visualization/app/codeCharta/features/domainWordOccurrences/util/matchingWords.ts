import { DomainWord } from "../../../model/codeCharta.model"

export function matchingWords(words: DomainWord[], query: string): DomainWord[] {
    const normalizedQuery = query.trim().toLowerCase()
    return words.filter(({ text }) => text.toLowerCase().includes(normalizedQuery)).sort(byDescendingFrequencyThenText)
}

function byDescendingFrequencyThenText(one: DomainWord, other: DomainWord): number {
    return other.frequency - one.frequency || one.text.localeCompare(other.text)
}
