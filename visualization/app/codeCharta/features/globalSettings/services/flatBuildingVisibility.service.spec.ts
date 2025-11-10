import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { FlatBuildingVisibilityService } from "./flatBuildingVisibility.service"
import { FlatBuildingVisibilityStore } from "../stores/flatBuildingVisibility.store"

describe("FlatBuildingVisibilityService", () => {
    let service: FlatBuildingVisibilityService
    let mockStore: jest.Mocked<FlatBuildingVisibilityStore>

    beforeEach(() => {
        mockStore = {
            hideFlatBuildings$: of(false),
            setHideFlatBuildings: jest.fn()
        } as any

        TestBed.configureTestingModule({
            providers: [FlatBuildingVisibilityService, { provide: FlatBuildingVisibilityStore, useValue: mockStore }]
        })

        service = TestBed.inject(FlatBuildingVisibilityService)
    })

    describe("hideFlatBuildings$", () => {
        it("should return Observable from store", done => {
            // Arrange
            mockStore.hideFlatBuildings$ = of(true)

            // Act & Assert
            service.hideFlatBuildings$().subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should return false from store when flat buildings are visible", done => {
            // Arrange
            mockStore.hideFlatBuildings$ = of(false)

            // Act & Assert
            service.hideFlatBuildings$().subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setHideFlatBuildings", () => {
        it("should delegate to store with true", () => {
            // Arrange & Act
            service.setHideFlatBuildings(true)

            // Assert
            expect(mockStore.setHideFlatBuildings).toHaveBeenCalledWith(true)
        })

        it("should delegate to store with false", () => {
            // Arrange & Act
            service.setHideFlatBuildings(false)

            // Assert
            expect(mockStore.setHideFlatBuildings).toHaveBeenCalledWith(false)
        })
    })
})
