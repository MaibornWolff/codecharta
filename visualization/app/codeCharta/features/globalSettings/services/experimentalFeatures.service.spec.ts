import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { ExperimentalFeaturesService } from "./experimentalFeatures.service"
import { ExperimentalFeaturesStore } from "../stores/experimentalFeatures.store"

describe("ExperimentalFeaturesService", () => {
    let service: ExperimentalFeaturesService
    let mockStore: jest.Mocked<ExperimentalFeaturesStore>

    beforeEach(() => {
        mockStore = {
            experimentalFeaturesEnabled$: of(false),
            setExperimentalFeaturesEnabled: jest.fn()
        } as any

        TestBed.configureTestingModule({
            providers: [ExperimentalFeaturesService, { provide: ExperimentalFeaturesStore, useValue: mockStore }]
        })

        service = TestBed.inject(ExperimentalFeaturesService)
    })

    describe("experimentalFeaturesEnabled$", () => {
        it("should return Observable from store", done => {
            // Arrange
            mockStore.experimentalFeaturesEnabled$ = of(true)

            // Act & Assert
            service.experimentalFeaturesEnabled$().subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should return false from store when experimental features disabled", done => {
            // Arrange
            mockStore.experimentalFeaturesEnabled$ = of(false)

            // Act & Assert
            service.experimentalFeaturesEnabled$().subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setExperimentalFeaturesEnabled", () => {
        it("should delegate to store with true", () => {
            // Arrange & Act
            service.setExperimentalFeaturesEnabled(true)

            // Assert
            expect(mockStore.setExperimentalFeaturesEnabled).toHaveBeenCalledWith(true)
        })

        it("should delegate to store with false", () => {
            // Arrange & Act
            service.setExperimentalFeaturesEnabled(false)

            // Assert
            expect(mockStore.setExperimentalFeaturesEnabled).toHaveBeenCalledWith(false)
        })
    })
})
