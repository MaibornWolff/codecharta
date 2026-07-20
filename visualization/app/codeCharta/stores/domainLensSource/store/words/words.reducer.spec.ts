import { DomainLensData } from "../../../../model/codeCharta.model"
import { setDomainWords } from "./words.actions"
import { domainWords } from "./words.reducer"

describe("domainWords", () => {
    const defaultValue: DomainLensData = {}

    describe("Action: SET_DOMAIN_WORDS", () => {
        it("should set new domain words", () => {
            // Arrange
            const value: DomainLensData = { "/root": [{ text: "invoice", frequency: 12, tfidf: 0.4 }] }

            // Act
            const result = domainWords(defaultValue, setDomainWords({ value }))

            // Assert
            expect(result).toEqual(value)
        })

        it("should reset to the default when the payload is undefined", () => {
            // Arrange
            const value = undefined as unknown as DomainLensData

            // Act
            const result = domainWords({ "/root": [{ text: "invoice", frequency: 1 }] }, setDomainWords({ value }))

            // Assert
            expect(result).toEqual(defaultValue)
        })
    })
})
