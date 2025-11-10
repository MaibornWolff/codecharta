import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { AutomaticCameraResetService } from "./automaticCameraReset.service"
import { AutomaticCameraResetStore } from "../stores/automaticCameraReset.store"

describe("AutomaticCameraResetService", () => {
    let service: AutomaticCameraResetService
    let mockStore: jest.Mocked<AutomaticCameraResetStore>

    beforeEach(() => {
        mockStore = {
            resetCameraIfNewFileIsLoaded$: of(true),
            setResetCameraIfNewFileIsLoaded: jest.fn()
        } as any

        TestBed.configureTestingModule({
            providers: [AutomaticCameraResetService, { provide: AutomaticCameraResetStore, useValue: mockStore }]
        })

        service = TestBed.inject(AutomaticCameraResetService)
    })

    describe("resetCameraIfNewFileIsLoaded$", () => {
        it("should return Observable from store", done => {
            // Arrange
            mockStore.resetCameraIfNewFileIsLoaded$ = of(true)

            // Act & Assert
            service.resetCameraIfNewFileIsLoaded$().subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should return false from store when camera reset is disabled", done => {
            // Arrange
            mockStore.resetCameraIfNewFileIsLoaded$ = of(false)

            // Act & Assert
            service.resetCameraIfNewFileIsLoaded$().subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setResetCameraIfNewFileIsLoaded", () => {
        it("should delegate to store with true", () => {
            // Arrange & Act
            service.setResetCameraIfNewFileIsLoaded(true)

            // Assert
            expect(mockStore.setResetCameraIfNewFileIsLoaded).toHaveBeenCalledWith(true)
        })

        it("should delegate to store with false", () => {
            // Arrange & Act
            service.setResetCameraIfNewFileIsLoaded(false)

            // Assert
            expect(mockStore.setResetCameraIfNewFileIsLoaded).toHaveBeenCalledWith(false)
        })
    })
})
