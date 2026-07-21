import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { STATE } from "../../../mocks/dataMocks"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"
import { WordCloudReadStore } from "./wordCloud.read.store"

describe("WordCloudReadStore", () => {
    const rootWords: DomainWord[] = [{ text: "invoice", frequency: 12 }]
    const leafWords: DomainWord[] = [{ text: "payment", frequency: 5 }]

    function setup(words: Record<string, DomainWord[]>) {
        const state: CcState = { ...STATE, domainLensSource: { words } }
        TestBed.configureTestingModule({
            providers: [provideMockStore({ initialState: state })]
        })
        return TestBed.inject(WordCloudReadStore)
    }

    it("should stream the words of the given node path", async () => {
        // Arrange
        const readStore = setup({ "/root/leaf": leafWords })

        // Act
        const result = await firstValueFrom(readStore.wordsForSelectedNode("/root/leaf"))

        // Assert
        expect(result).toEqual(leafWords)
    })

    it("should fall back to the root node's words for a null path", async () => {
        // Arrange
        fileRoot.updateRoot("root")
        const readStore = setup({ [fileRoot.rootPath]: rootWords })

        // Act
        const result = await firstValueFrom(readStore.wordsForSelectedNode(null))

        // Assert
        expect(result).toEqual(rootWords)
    })

    it("should name the root for a null path and the leaf name for a path", () => {
        // Arrange
        fileRoot.updateRoot("root")
        const readStore = setup({})

        // Act & Assert
        expect(readStore.selectedNodeName(null)).toBe(fileRoot.rootName)
        expect(readStore.selectedNodeName("/root/src/main.ts")).toBe("main.ts")
    })
})
