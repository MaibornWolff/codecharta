import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { STATE } from "../../../mocks/dataMocks"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"
import { DomainWordOccurrencesReadStore } from "./domainWordOccurrences.read.store"

describe("DomainWordOccurrencesReadStore", () => {
    const projectWords: DomainWord[] = [
        { text: "invoice", frequency: 12 },
        { text: "payment", frequency: 5 }
    ]

    function setup(hiddenWords: string[] = []) {
        fileRoot.updateRoot("root")
        const state: CcState = {
            ...STATE,
            domainLensSource: { words: { [fileRoot.rootPath]: projectWords } },
            domainState: { ...STATE.domainState, hiddenWords }
        }
        TestBed.configureTestingModule({ providers: [provideMockStore({ initialState: state })] })
        return TestBed.inject(DomainWordOccurrencesReadStore)
    }

    it("should stream every word of the project", async () => {
        // Arrange
        const readStore = setup()

        // Act
        const result = await firstValueFrom(readStore.projectWords$)

        // Assert
        expect(result.map(word => word.text)).toEqual(["invoice", "payment"])
    })

    it("should leave a hidden word out of the word list", async () => {
        // Arrange
        const readStore = setup(["invoice"])

        // Act
        const result = await firstValueFrom(readStore.projectWords$)

        // Assert
        expect(result.map(word => word.text)).toEqual(["payment"])
    })
})
