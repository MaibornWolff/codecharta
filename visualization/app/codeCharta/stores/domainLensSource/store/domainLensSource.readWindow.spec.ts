import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { STATE } from "../../../mocks/dataMocks"
import { CcState, DomainLensData } from "../../../model/codeCharta.model"
import { DomainLensSourceReadWindow } from "./domainLensSource.readWindow"

describe("DomainLensSourceReadWindow", () => {
    const words: DomainLensData = { "/root": [{ text: "invoice", frequency: 12 }] }

    function setup() {
        const state: CcState = { ...STATE, domainLensSource: { words } }
        TestBed.configureTestingModule({
            providers: [provideMockStore({ initialState: state }), { provide: State, useValue: { getValue: () => state } }]
        })
        return TestBed.inject(DomainLensSourceReadWindow)
    }

    it("should read the current domain words synchronously", () => {
        // Arrange
        const readWindow = setup()

        // Act & Assert
        expect(readWindow.getDomainWords()).toEqual(words)
        expect(readWindow.getDomainLensSource()).toEqual({ words })
    })

    it("should expose the domain words stream", async () => {
        // Arrange
        const readWindow = setup()

        // Act
        const result = await firstValueFrom(readWindow.domainWords$)

        // Assert
        expect(result).toEqual(words)
    })
})
