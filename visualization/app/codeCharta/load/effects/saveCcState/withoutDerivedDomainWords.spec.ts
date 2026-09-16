import { CcState } from "../../../model/codeCharta.model"
import { withoutDerivedDomainWords } from "./withoutDerivedDomainWords"

function stateWithWords(): CcState {
    return {
        domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } },
        domainState: { hiddenWords: ["payment"] }
    } as unknown as CcState
}

describe("withoutDerivedDomainWords", () => {
    it("should drop the merged word bank, so it is not written a second time", () => {
        // Arrange
        const state = stateWithWords()

        // Act
        const persisted = withoutDerivedDomainWords(state)

        // Assert
        expect(persisted.domainLensSource.words).toEqual({})
    })

    it("should keep everything else the session needs to come back", () => {
        // Arrange
        const state = stateWithWords()

        // Act
        const persisted = withoutDerivedDomainWords(state)

        // Assert — the words the reader hid are their own state, not derived from any file
        expect(persisted.domainState).toEqual(state.domainState)
    })

    it("should leave the state it was given untouched", () => {
        // Arrange
        const state = stateWithWords()

        // Act
        withoutDerivedDomainWords(state)

        // Assert
        expect(state.domainLensSource.words).toEqual({ "/root": [{ text: "invoice", frequency: 10 }] })
    })
})
