import { DomainWord } from "../model/codeCharta.model"

/** A word the reader hid leaves the cloud and the explorer's word list alike, so both are filtered here. */
export function withoutHiddenWords(words: DomainWord[], hiddenWords: string[]): DomainWord[] {
    if (hiddenWords.length === 0) {
        return words
    }
    const hidden = new Set(hiddenWords)
    return words.filter(word => !hidden.has(word.text))
}
