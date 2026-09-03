import { hideDomainWord, restoreAllDomainWords, restoreDomainWord } from "./hiddenWords.actions"
import { defaultHiddenWords, hiddenWords } from "./hiddenWords.reducer"

describe("hiddenWords", () => {
    it("should hide no word by default", () => {
        // Arrange & Act
        const result = hiddenWords(undefined, { type: "@@init" })

        // Assert
        expect(result).toEqual([])
    })

    it("should hide a word", () => {
        // Arrange & Act
        const result = hiddenWords(defaultHiddenWords, hideDomainWord({ word: "invoice" }))

        // Assert
        expect(result).toEqual(["invoice"])
    })

    it("should keep a word hidden only once when it is hidden again", () => {
        // Arrange
        const alreadyHidden = ["invoice"]

        // Act
        const result = hiddenWords(alreadyHidden, hideDomainWord({ word: "invoice" }))

        // Assert
        expect(result).toEqual(["invoice"])
    })

    it("should restore one word and leave the others hidden", () => {
        // Arrange
        const hidden = ["invoice", "payment"]

        // Act
        const result = hiddenWords(hidden, restoreDomainWord({ word: "invoice" }))

        // Assert
        expect(result).toEqual(["payment"])
    })

    it("should restore every hidden word at once", () => {
        // Arrange
        const hidden = ["invoice", "payment"]

        // Act
        const result = hiddenWords(hidden, restoreAllDomainWords())

        // Assert
        expect(result).toEqual([])
    })
})
