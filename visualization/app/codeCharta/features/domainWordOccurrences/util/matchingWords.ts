import { DomainWord } from "../../../model/codeCharta.model"

const TERM_SEPARATORS = /[\s,]+/

export function matchingWords(words: DomainWord[], query: string): DomainWord[] {
    const terms = query
        .toLowerCase()
        .split(TERM_SEPARATORS)
        .filter(term => term.length > 0)
    if (terms.length === 0) {
        return words
    }
    return words.filter(({ text }) => {
        const normalizedText = text.toLowerCase()
        return terms.some(term => normalizedText.includes(term))
    })
}
