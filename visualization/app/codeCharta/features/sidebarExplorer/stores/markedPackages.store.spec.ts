import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { MarkedPackage } from "../../../model/codeCharta.model"
import { markedPackagesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { MarkedPackagesStore } from "./markedPackages.store"

describe("MarkedPackagesStore", () => {
    let store: MarkedPackagesStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MarkedPackagesStore, provideMockStore({ selectors: [{ selector: markedPackagesSelector, value: [] }] })]
        })

        store = TestBed.inject(MarkedPackagesStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("markedPackages$", () => {
        it("should emit value from selector", done => {
            // Arrange
            const updated: MarkedPackage[] = [{ path: "/root/folder", color: "#ff0000" }]
            mockStore.overrideSelector(markedPackagesSelector, updated)
            mockStore.refreshState()

            // Act & Assert
            store.markedPackages$.subscribe(value => {
                expect(value).toEqual(updated)
                done()
            })
        })
    })
})
