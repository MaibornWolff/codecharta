import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { MapLayoutService } from "./mapLayout.service"
import { MapLayoutStore } from "../stores/mapLayout.store"
import { LayoutAlgorithm } from "../../../codeCharta.model"

describe("MapLayoutService", () => {
    let service: MapLayoutService
    let mockStore: jest.Mocked<Partial<MapLayoutStore>>

    beforeEach(() => {
        mockStore = {
            layoutAlgorithm$: of(LayoutAlgorithm.SquarifiedTreeMap),
            maxTreeMapFiles$: of(100),
            setLayoutAlgorithm: jest.fn(),
            setMaxTreeMapFiles: jest.fn()
        }

        TestBed.configureTestingModule({
            providers: [MapLayoutService, { provide: MapLayoutStore, useValue: mockStore }]
        })

        service = TestBed.inject(MapLayoutService)
    })

    describe("layoutAlgorithm$", () => {
        it("should return Observable from store with SquarifiedTreeMap", done => {
            // Arrange
            mockStore.layoutAlgorithm$ = of(LayoutAlgorithm.SquarifiedTreeMap)

            // Act & Assert
            service.layoutAlgorithm$().subscribe(value => {
                expect(value).toBe(LayoutAlgorithm.SquarifiedTreeMap)
                done()
            })
        })

        it("should return Observable from store with StreetMap", done => {
            // Arrange
            mockStore.layoutAlgorithm$ = of(LayoutAlgorithm.StreetMap)

            // Act & Assert
            service.layoutAlgorithm$().subscribe(value => {
                expect(value).toBe(LayoutAlgorithm.StreetMap)
                done()
            })
        })

        it("should return Observable from store with TreeMapStreet", done => {
            // Arrange
            mockStore.layoutAlgorithm$ = of(LayoutAlgorithm.TreeMapStreet)

            // Act & Assert
            service.layoutAlgorithm$().subscribe(value => {
                expect(value).toBe(LayoutAlgorithm.TreeMapStreet)
                done()
            })
        })
    })

    describe("maxTreeMapFiles$", () => {
        it("should return Observable from store", done => {
            // Arrange
            mockStore.maxTreeMapFiles$ = of(250)

            // Act & Assert
            service.maxTreeMapFiles$().subscribe(value => {
                expect(value).toBe(250)
                done()
            })
        })

        it("should return minimum value from store", done => {
            // Arrange
            mockStore.maxTreeMapFiles$ = of(1)

            // Act & Assert
            service.maxTreeMapFiles$().subscribe(value => {
                expect(value).toBe(1)
                done()
            })
        })

        it("should return maximum value from store", done => {
            // Arrange
            mockStore.maxTreeMapFiles$ = of(1000)

            // Act & Assert
            service.maxTreeMapFiles$().subscribe(value => {
                expect(value).toBe(1000)
                done()
            })
        })
    })

    describe("setLayoutAlgorithm", () => {
        it("should delegate to store with SquarifiedTreeMap", () => {
            // Arrange & Act
            service.setLayoutAlgorithm(LayoutAlgorithm.SquarifiedTreeMap)

            // Assert
            expect(mockStore.setLayoutAlgorithm).toHaveBeenCalledWith(LayoutAlgorithm.SquarifiedTreeMap)
        })

        it("should delegate to store with StreetMap", () => {
            // Arrange & Act
            service.setLayoutAlgorithm(LayoutAlgorithm.StreetMap)

            // Assert
            expect(mockStore.setLayoutAlgorithm).toHaveBeenCalledWith(LayoutAlgorithm.StreetMap)
        })

        it("should delegate to store with TreeMapStreet", () => {
            // Arrange & Act
            service.setLayoutAlgorithm(LayoutAlgorithm.TreeMapStreet)

            // Assert
            expect(mockStore.setLayoutAlgorithm).toHaveBeenCalledWith(LayoutAlgorithm.TreeMapStreet)
        })
    })

    describe("setMaxTreeMapFiles", () => {
        it("should delegate to store with value", () => {
            // Arrange & Act
            service.setMaxTreeMapFiles(250)

            // Assert
            expect(mockStore.setMaxTreeMapFiles).toHaveBeenCalledWith(250)
        })

        it("should delegate to store with minimum value", () => {
            // Arrange & Act
            service.setMaxTreeMapFiles(1)

            // Assert
            expect(mockStore.setMaxTreeMapFiles).toHaveBeenCalledWith(1)
        })

        it("should delegate to store with maximum value", () => {
            // Arrange & Act
            service.setMaxTreeMapFiles(1000)

            // Assert
            expect(mockStore.setMaxTreeMapFiles).toHaveBeenCalledWith(1000)
        })
    })
})
