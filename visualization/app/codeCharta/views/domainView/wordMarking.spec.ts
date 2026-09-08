import { DomainWord } from "../../model/codeCharta.model"
import { wordsToMark } from "./wordMarking"

const PROJECT_WORDS: DomainWord[] = [
    { text: "payment", frequency: 30 },
    { text: "prepaid", frequency: 12 },
    { text: "invoice", frequency: 42 }
]

describe("wordsToMark", () => {
    it("should mark every word the search matched", () => {
        // Arrange
        const query = "pa"

        // Act
        const marked = wordsToMark(null, PROJECT_WORDS, query, true)

        // Assert
        expect(marked).toEqual(["payment", "prepaid"])
    })

    it("should mark the inspected word alongside the search matches", () => {
        // Arrange
        const query = "pa"

        // Act
        const marked = wordsToMark("invoice", PROJECT_WORDS, query, true)

        // Assert
        expect(marked).toEqual(["invoice", "payment", "prepaid"])
    })

    it("should mark the inspected word only once when the search matched it too", () => {
        // Arrange
        const query = "invo"

        // Act
        const marked = wordsToMark("invoice", PROJECT_WORDS, query, true)

        // Assert
        expect(marked).toEqual(["invoice"])
    })

    it("should mark nothing extra for an empty query, which every word matches", () => {
        // Arrange
        const query = "   "

        // Act
        const marked = wordsToMark(null, PROJECT_WORDS, query, true)

        // Assert
        expect(marked).toEqual([])
    })

    it("should ignore the word search while the explorer browses files", () => {
        // Arrange — the search box filters paths there, so its word query is invisible.
        const query = "pa"

        // Act
        const marked = wordsToMark("invoice", PROJECT_WORDS, query, false)

        // Assert
        expect(marked).toEqual(["invoice"])
    })
})
