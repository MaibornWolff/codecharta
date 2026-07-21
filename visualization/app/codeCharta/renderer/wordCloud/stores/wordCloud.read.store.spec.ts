import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { STATE } from "../../../mocks/dataMocks"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"
import { WordCloudReadStore } from "./wordCloud.read.store"

describe("WordCloudReadStore", () => {
    const rootWords: DomainWord[] = [{ text: "invoice", frequency: 12 }]
    const leafWords: DomainWord[] = [{ text: "payment", frequency: 5 }]

    function setup(selectedBuildingId: string | null, words: Record<string, DomainWord[]>) {
        const state: CcState = {
            ...STATE,
            sharedView: { ...STATE.sharedView, selectedBuildingId },
            domainLensSource: { words }
        }
        TestBed.configureTestingModule({
            providers: [provideMockStore({ initialState: state }), { provide: State, useValue: { getValue: () => state } }]
        })
        return TestBed.inject(WordCloudReadStore)
    }

    it("should stream the selected node's words", async () => {
        // Arrange
        const readStore = setup("/root/leaf", { "/root/leaf": leafWords })

        // Act
        const result = await firstValueFrom(readStore.wordsForSelectedNode$)

        // Assert
        expect(result).toEqual(leafWords)
    })

    it("should fall back to the root node's words when nothing is selected", async () => {
        // Arrange
        fileRoot.updateRoot("root")
        const readStore = setup(null, { [fileRoot.rootPath]: rootWords })

        // Act
        const result = await firstValueFrom(readStore.wordsForSelectedNode$)

        // Assert
        expect(result).toEqual(rootWords)
    })
})
