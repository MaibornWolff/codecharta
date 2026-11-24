import { DomainWord } from "../../../model/codeCharta.model"
import { matchingWords } from "./matchingWords"

const word = (text: string, frequency: number): DomainWord => ({ text, frequency })

describe("matchingWords", () => {
    it("should keep only words containing the query, ignoring case and padding", () => {
        // Arrange
        const words = [word("Payment", 30), word("prepayment", 5), word("invoice", 12)]

        // Act
        const matches = matchingWords(words, "  PAY ")

        // Assert
        expect(matches.map(({ text }) => text)).toEqual(["Payment", "prepayment"])
    })

    it("should keep the words containing any of several terms separated by spaces or commas", () => {
        // Arrange
        const words = [word("payment", 30), word("invoice", 12), word("customer", 8), word("order", 3)]

        // Act
        const matches = matchingWords(words, "payment, invoice  ORDER")

        // Assert
        expect(matches.map(({ text }) => text)).toEqual(["payment", "invoice", "order"])
    })

    it("should keep the words it is given in their order", () => {
        // Arrange — sorting is the sort control's job
        const words = [word("invoice", 12), word("payment", 30)]

        // Act
        const matches = matchingWords(words, "")

        // Assert
        expect(matches.map(({ text }) => text)).toEqual(["invoice", "payment"])
    })
})
