import { DomainWord } from "../../../model/codeCharta.model"
import { sortWords, WordSortingOption } from "./sortWords"

const word = (text: string, frequency: number, tfidf?: number): DomainWord => ({ text, frequency, tfidf })

const textsOf = (words: DomainWord[]) => words.map(({ text }) => text)

describe("sortWords", () => {
    it("should put the most frequent word first when sorting by occurrences descending", () => {
        // Arrange
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        const sorted = sortWords(words, { option: WordSortingOption.OCCURRENCES, ascending: false })

        // Assert
        expect(textsOf(sorted)).toEqual(["payment", "invoice"])
    })

    it("should put the rarest word first when sorting by occurrences ascending", () => {
        // Arrange
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        const sorted = sortWords(words, { option: WordSortingOption.OCCURRENCES, ascending: true })

        // Assert
        expect(textsOf(sorted)).toEqual(["invoice", "payment"])
    })

    it("should sort words alphabetically by name", () => {
        // Arrange
        const words = [word("payment", 30), word("invoice", 12)]

        // Act
        const sorted = sortWords(words, { option: WordSortingOption.NAME, ascending: true })

        // Assert
        expect(textsOf(sorted)).toEqual(["invoice", "payment"])
    })

    it("should sort by the words' relevance when asked for it", () => {
        // Arrange — the frequent word is the less telling one
        const words = [word("payment", 30, 0.1), word("invoice", 12, 0.9)]

        // Act
        const sorted = sortWords(words, { option: WordSortingOption.RELEVANCE, ascending: false })

        // Assert
        expect(textsOf(sorted)).toEqual(["invoice", "payment"])
    })

    it("should fall back to a word's occurrences when the project carries no relevance", () => {
        // Arrange — as the word cloud does when sized by relevance
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        const sorted = sortWords(words, { option: WordSortingOption.RELEVANCE, ascending: false })

        // Assert
        expect(textsOf(sorted)).toEqual(["payment", "invoice"])
    })

    it("should break a tie alphabetically, whichever direction is sorted", () => {
        // Arrange
        const words = [word("payment", 12), word("invoice", 12)]

        // Act
        const descending = sortWords(words, { option: WordSortingOption.OCCURRENCES, ascending: false })
        const ascending = sortWords(words, { option: WordSortingOption.OCCURRENCES, ascending: true })

        // Assert
        expect(textsOf(descending)).toEqual(["invoice", "payment"])
        expect(textsOf(ascending)).toEqual(["invoice", "payment"])
    })

    it("should not mutate the given words", () => {
        // Arrange
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        sortWords(words, { option: WordSortingOption.OCCURRENCES, ascending: false })

        // Assert
        expect(textsOf(words)).toEqual(["invoice", "payment"])
    })
})
