import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { MapLayoutStore } from "./mapLayout.store"
import { layoutAlgorithmSelector, maxTreeMapFilesSelector } from "../selectors/globalSettings.selectors"
import { setLayoutAlgorithm } from "../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { LayoutAlgorithm } from "../../../codeCharta.model"

describe("MapLayoutStore", () => {
    let store: MapLayoutStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MapLayoutStore,
                provideMockStore({
                    selectors: [
                        { selector: layoutAlgorithmSelector, value: LayoutAlgorithm.SquarifiedTreeMap },
                        { selector: maxTreeMapFilesSelector, value: 100 }
                    ]
                })
            ]
        })

        store = TestBed.inject(MapLayoutStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("layoutAlgorithm$", () => {
        it("should emit SquarifiedTreeMap from selector", done => {
            // Arrange
            mockStore.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.SquarifiedTreeMap)
            mockStore.refreshState()

            // Act & Assert
            store.layoutAlgorithm$.subscribe(value => {
                expect(value).toBe(LayoutAlgorithm.SquarifiedTreeMap)
                done()
            })
        })

        it("should emit StreetMap when selector returns StreetMap", done => {
            // Arrange
            mockStore.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.StreetMap)
            mockStore.refreshState()

            // Act & Assert
            store.layoutAlgorithm$.subscribe(value => {
                expect(value).toBe(LayoutAlgorithm.StreetMap)
                done()
            })
        })

        it("should emit TreeMapStreet when selector returns TreeMapStreet", done => {
            // Arrange
            mockStore.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.TreeMapStreet)
            mockStore.refreshState()

            // Act & Assert
            store.layoutAlgorithm$.subscribe(value => {
                expect(value).toBe(LayoutAlgorithm.TreeMapStreet)
                done()
            })
        })
    })

    describe("maxTreeMapFiles$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(maxTreeMapFilesSelector, 250)
            mockStore.refreshState()

            // Act & Assert
            store.maxTreeMapFiles$.subscribe(value => {
                expect(value).toBe(250)
                done()
            })
        })

        it("should emit minimum value", done => {
            // Arrange
            mockStore.overrideSelector(maxTreeMapFilesSelector, 1)
            mockStore.refreshState()

            // Act & Assert
            store.maxTreeMapFiles$.subscribe(value => {
                expect(value).toBe(1)
                done()
            })
        })

        it("should emit maximum value", done => {
            // Arrange
            mockStore.overrideSelector(maxTreeMapFilesSelector, 1000)
            mockStore.refreshState()

            // Act & Assert
            store.maxTreeMapFiles$.subscribe(value => {
                expect(value).toBe(1000)
                done()
            })
        })
    })

    describe("setLayoutAlgorithm", () => {
        it("should dispatch setLayoutAlgorithm action with SquarifiedTreeMap", async () => {
            // Arrange & Act
            store.setLayoutAlgorithm(LayoutAlgorithm.SquarifiedTreeMap)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setLayoutAlgorithm({ value: LayoutAlgorithm.SquarifiedTreeMap }))
        })

        it("should dispatch setLayoutAlgorithm action with StreetMap", async () => {
            // Arrange & Act
            store.setLayoutAlgorithm(LayoutAlgorithm.StreetMap)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
        })

        it("should dispatch setLayoutAlgorithm action with TreeMapStreet", async () => {
            // Arrange & Act
            store.setLayoutAlgorithm(LayoutAlgorithm.TreeMapStreet)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setLayoutAlgorithm({ value: LayoutAlgorithm.TreeMapStreet }))
        })
    })

    describe("setMaxTreeMapFiles", () => {
        it("should dispatch setMaxTreeMapFiles action with value", async () => {
            // Arrange & Act
            store.setMaxTreeMapFiles(250)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setMaxTreeMapFiles({ value: 250 }))
        })

        it("should dispatch setMaxTreeMapFiles action with minimum value", async () => {
            // Arrange & Act
            store.setMaxTreeMapFiles(1)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setMaxTreeMapFiles({ value: 1 }))
        })

        it("should dispatch setMaxTreeMapFiles action with maximum value", async () => {
            // Arrange & Act
            store.setMaxTreeMapFiles(1000)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setMaxTreeMapFiles({ value: 1000 }))
        })
    })
})
