import { TestBed } from "@angular/core/testing"
import { Router } from "@angular/router"
import { provideMockStore } from "@ngrx/store/testing"
import { packageRowsSelector, securitySummarySelector } from "../../../lenses/security/security.facade"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"
import { SecurityReadStore } from "./security.read.store"
import { SecurityWriteStore } from "./security.write.store"

describe("security stores", () => {
    const navigateByUrl = jest.fn(() => Promise.resolve(true))

    beforeEach(() => {
        navigateByUrl.mockClear()
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: packageRowsSelector, value: [] },
                        { selector: securitySummarySelector, value: null }
                    ]
                }),
                { provide: Router, useValue: { navigateByUrl } }
            ]
        })
    })

    it("should read the rows and the summary of the shown maps", () => {
        // Arrange & Act
        const readStore = TestBed.inject(SecurityReadStore)

        // Assert
        expect(readStore.rows()).toEqual([])
        expect(readStore.summary()).toBeNull()
    })

    it("should hand a file over to the metric map and go there", () => {
        // Arrange
        const writeStore = TestBed.inject(SecurityWriteStore)

        // Act
        writeStore.showFileInMap("/root/src/app.ts")

        // Assert
        expect(TestBed.inject(ViewHandoffStore).takeNodeFor("metrics")).toBe("/root/src/app.ts")
        expect(navigateByUrl).toHaveBeenCalledWith("/")
    })
})
