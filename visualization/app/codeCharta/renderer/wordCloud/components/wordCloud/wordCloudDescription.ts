import { DomainWord } from "../../../../model/codeCharta.model"

export const SCREEN_READER_WORD_COUNT = 10

const ARIA_HEADLINE_WORD_COUNT = 3

export function describeWordCloud(renderedWords: DomainWord[], selectedNodeName: string): string {
    const leadingWords = renderedWords
        .slice(0, ARIA_HEADLINE_WORD_COUNT)
        .map(word => word.text)
        .join(", ")
    const termLabel = renderedWords.length === 1 ? "domain term" : "domain terms"
    return `Word cloud of ${renderedWords.length} ${termLabel} for ${selectedNodeName}; largest: ${leadingWords}`
}

export function describeDroppedWords(drawnWordCount: number | null, requestedWordCount: number): string | null {
    if (drawnWordCount === null || drawnWordCount >= requestedWordCount) {
        return null
    }
    return `${drawnWordCount} of ${requestedWordCount} words fit — enlarge the window, reduce word spacing, or enable "Fit all words" or "Draw outside bounds"`
}
