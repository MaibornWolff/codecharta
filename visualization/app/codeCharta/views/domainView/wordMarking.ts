import { hasSearchTerms, matchingWords } from "../../features/domainWordOccurrences/facade"
import { DomainWord } from "../../model/codeCharta.model"

/**
 * What the cloud marks: the word the explorer broke down, and every word its search matched. The
 * search only counts while the explorer browses words — on its file tree the box filters paths, and
 * a mark from a query nobody can see reads as a bug. A query without terms matches every word, so it
 * marks nothing on its own.
 */
export function wordsToMark(inspectedWord: string | null, wordsInFocus: DomainWord[], wordQuery: string, browsesWords: boolean): string[] {
    const searchedWords = browsesWords && hasSearchTerms(wordQuery) ? matchingWords(wordsInFocus, wordQuery).map(({ text }) => text) : []
    if (inspectedWord === null || searchedWords.includes(inspectedWord)) {
        return searchedWords
    }
    return [inspectedWord, ...searchedWords]
}
