import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { STATE } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudShape } from "../../../model/wordCloud.model"
import { DomainStateReadWindow } from "./domainState.readWindow"

describe("DomainStateReadWindow", () => {
    function setup(domainState = defaultWordCloudSettings) {
        const state: CcState = { ...STATE, domainState }
        TestBed.configureTestingModule({
            providers: [provideMockStore({ initialState: state }), { provide: State, useValue: { getValue: () => state } }]
        })
        return TestBed.inject(DomainStateReadWindow)
    }

    it("should read the current domain bar settings synchronously", () => {
        // Arrange
        const domainState = { ...defaultWordCloudSettings, shape: WordCloudShape.diamond }
        const readWindow = setup(domainState)

        // Act & Assert
        expect(readWindow.getDomainState()).toEqual(domainState)
    })

    it("should expose the composed word-cloud settings stream", async () => {
        // Arrange
        const readWindow = setup()

        // Act
        const settings = await firstValueFrom(readWindow.wordCloudSettings$)

        // Assert
        expect(settings).toEqual(defaultWordCloudSettings)
    })
})
