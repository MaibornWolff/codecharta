import { DomainWord } from "../../../model/codeCharta.model"
import { matchingWords } from "./matchingWords"

const word = (text: string, frequency: number): DomainWord => ({ text, frequency })

describe("matchingWords", () => {
    it("should sort words by descending frequency", () => {
        // Arrange
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        const matches = matchingWords(words, "")

        // Assert
        expect(matches.map(({ text }) => text)).toEqual(["payment", "invoice"])
    })

    it("should sort words of equal frequency alphabetically", () => {
        // Arrange
        const words = [word("payment", 12), word("invoice", 12)]

        // Act
        const matches = matchingWords(words, "")

        // Assert
        expect(matches.map(({ text }) => text)).toEqual(["invoice", "payment"])
    })

    it("should keep only words containing the query, ignoring case and padding", () => {
        // Arrange
        const words = [word("Payment", 30), word("prepayment", 5), word("invoice", 12)]

        // Act
        const matches = matchingWords(words, "  PAY ")

        // Assert
        expect(matches.map(({ text }) => text)).toEqual(["Payment", "prepayment"])
    })

    it("should not mutate the given words", () => {
        // Arrange
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        matchingWords(words, "")

        // Assert
        expect(words.map(({ text }) => text)).toEqual(["invoice", "payment"])
    })
})
