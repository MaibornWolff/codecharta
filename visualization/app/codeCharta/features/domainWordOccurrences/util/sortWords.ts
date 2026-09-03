import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode, wordSizingValue } from "../../../model/wordCloud.model"

export enum WordSortingOption {
    OCCURRENCES = "Occurrences",
    NAME = "Name",
    RELEVANCE = "Relevance"
}

export interface WordSorting {
    option: WordSortingOption
    ascending: boolean
}

const compareByOption: Record<WordSortingOption, (one: DomainWord, other: DomainWord) => number> = {
    [WordSortingOption.OCCURRENCES]: (one, other) => one.frequency - other.frequency,
    [WordSortingOption.NAME]: (one, other) => one.text.localeCompare(other.text),
    [WordSortingOption.RELEVANCE]: (one, other) =>
        wordSizingValue(one, WordCloudSizingMode.tfidf) - wordSizingValue(other, WordCloudSizingMode.tfidf)
}

export function sortWords(words: DomainWord[], { option, ascending }: WordSorting): DomainWord[] {
    const compare = compareByOption[option]
    const direction = ascending ? 1 : -1
    return [...words].sort((one, other) => direction * compare(one, other) || one.text.localeCompare(other.text))
}
