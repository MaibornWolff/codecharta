import { matchingWords } from "../../features/domainWordOccurrences/facade"
import { DomainWord } from "../../model/codeCharta.model"

/**
 * What the cloud marks: the word the explorer broke down, and every word its search matched. The
 * search only counts while the explorer browses words — on its file tree the box filters paths, and
 * a mark from a query nobody can see reads as a bug. An empty query matches every word, so it marks
 * nothing on its own.
 */
export function wordsToMark(inspectedWord: string | null, projectWords: DomainWord[], wordQuery: string, browsesWords: boolean): string[] {
    const searchedWords = browsesWords && wordQuery.trim().length > 0 ? matchingWords(projectWords, wordQuery).map(({ text }) => text) : []
    if (inspectedWord === null || searchedWords.includes(inspectedWord)) {
        return searchedWords
    }
    return [inspectedWord, ...searchedWords]
}
