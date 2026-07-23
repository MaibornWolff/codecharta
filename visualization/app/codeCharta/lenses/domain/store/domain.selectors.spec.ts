import { STATE } from "../../../mocks/dataMocks"
import { CcState, DomainLensData, DomainWord, FileSelectionState, FileState } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"
import {
    createWordsForSelectedNodeSelector,
    hasDomainDataSelector,
    hasTfidfDataSelector,
    isLoadedFileSetWithoutDomainLensSelector
} from "./domain.selectors"

describe("domain lens selectors", () => {
    const rootWords: DomainWord[] = [{ text: "invoice", frequency: 12, tfidf: 0.4 }]
    const leafWords: DomainWord[] = [{ text: "payment", frequency: 5 }]
    const persistedFileChecksum = "checksum-of-the-one-loaded-file"

    function stateWithWords(words: Record<string, DomainWord[]>): CcState {
        return { ...STATE, domainLensSource: { words } }
    }

    function aFileState(domainWords: DomainLensData, selectedAs: FileSelectionState): FileState {
        return {
            file: { fileMeta: { fileChecksum: persistedFileChecksum }, settings: { fileSettings: { domainWords } } },
            selectedAs
        } as FileState
    }

    function stateWithFiles(files: FileState[]): CcState {
        return { ...STATE, files }
    }

    describe("hasDomainDataSelector", () => {
        it("should be false when no domain words are present", () => {
            // Arrange
            const state = stateWithWords({})

            // Act
            const result = hasDomainDataSelector(state)

            // Assert
            expect(result).toBe(false)
        })

        it("should be true when at least one path carries domain words", () => {
            // Arrange
            const state = stateWithWords({ "/root": rootWords })

            // Act
            const result = hasDomainDataSelector(state)

            // Assert
            expect(result).toBe(true)
        })
    })

    describe("hasTfidfDataSelector", () => {
        it("should be false when no word carries a tfidf score", () => {
            // Arrange
            const state = stateWithWords({ "/root": leafWords })

            // Act
            const result = hasTfidfDataSelector(state)

            // Assert
            expect(result).toBe(false)
        })

        it("should be true when at least one word carries a tfidf score", () => {
            // Arrange
            const state = stateWithWords({ "/root": rootWords })

            // Act
            const result = hasTfidfDataSelector(state)

            // Assert
            expect(result).toBe(true)
        })
    })

    describe("createWordsForSelectedNodeSelector", () => {
        it("should return the selected node's words when an id is given", () => {
            // Arrange
            const state = stateWithWords({ "/root/leaf": leafWords })

            // Act
            const result = createWordsForSelectedNodeSelector("/root/leaf")(state)

            // Assert
            expect(result).toEqual(leafWords)
        })

        it("should fall back to the root path when the selected id is null", () => {
            // Arrange
            fileRoot.updateRoot("root")
            const state = stateWithWords({ [fileRoot.rootPath]: rootWords })

            // Act
            const result = createWordsForSelectedNodeSelector(null)(state)

            // Assert
            expect(result).toEqual(rootWords)
        })
    })

    describe("isLoadedFileSetWithoutDomainLensSelector", () => {
        it("should be false before any file is loaded, so a domain deep link survives its own boot", () => {
            // Arrange
            const state = stateWithFiles([])

            // Act
            const result = isLoadedFileSetWithoutDomainLensSelector(state)

            // Assert
            expect(result).toBe(false)
        })

        it("should be true when every visible file carries an empty domain bank", () => {
            // Arrange
            const state = stateWithFiles([aFileState({}, FileSelectionState.Partial)])

            // Act
            const result = isLoadedFileSetWithoutDomainLensSelector(state)

            // Assert
            expect(result).toBe(true)
        })

        it("should be false when at least one visible file carries a domain bank", () => {
            // Arrange
            const state = stateWithFiles([
                aFileState({}, FileSelectionState.Partial),
                aFileState({ "/root": rootWords }, FileSelectionState.Partial)
            ])

            // Act
            const result = isLoadedFileSetWithoutDomainLensSelector(state)

            // Assert
            expect(result).toBe(false)
        })

        it("should ignore deselected files, which the domain view never renders", () => {
            // Arrange
            const state = stateWithFiles([
                aFileState({}, FileSelectionState.Partial),
                aFileState({ "/root": rootWords }, FileSelectionState.None)
            ])

            // Act
            const result = isLoadedFileSetWithoutDomainLensSelector(state)

            // Assert
            expect(result).toBe(true)
        })

        it("should re-project when a restore replaces the parsed file with the persisted one", () => {
            // Arrange — the lossy re-parse is read first, exactly as the restore commits it
            const parsedState = stateWithFiles([aFileState({}, FileSelectionState.Partial)])
            expect(isLoadedFileSetWithoutDomainLensSelector(parsedState)).toBe(true)

            // Act — the persisted file state follows: same checksum, domain lens intact
            const restoredState = stateWithFiles([aFileState({ "/root": rootWords }, FileSelectionState.Partial)])
            const result = isLoadedFileSetWithoutDomainLensSelector(restoredState)

            // Assert
            expect(result).toBe(false)
        })
    })
})
