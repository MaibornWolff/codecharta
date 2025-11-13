import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { DisplayQualityService } from "./displayQuality.service"
import { DisplayQualityStore } from "../stores/displayQuality.store"
import { SharpnessMode } from "../../../codeCharta.model"

describe("DisplayQualityService", () => {
    let service: DisplayQualityService
    let mockStore: jest.Mocked<Partial<DisplayQualityStore>>

    beforeEach(() => {
        mockStore = {
            sharpnessMode$: of(SharpnessMode.Standard),
            setSharpnessMode: jest.fn()
        }

        TestBed.configureTestingModule({
            providers: [DisplayQualityService, { provide: DisplayQualityStore, useValue: mockStore }]
        })

        service = TestBed.inject(DisplayQualityService)
    })

    describe("sharpnessMode$", () => {
        it("should return Observable from store with Standard", done => {
            // Arrange
            mockStore.sharpnessMode$ = of(SharpnessMode.Standard)

            // Act & Assert
            service.sharpnessMode$().subscribe(value => {
                expect(value).toBe(SharpnessMode.Standard)
                done()
            })
        })

        it("should return Observable from store with PixelRatioFXAA", done => {
            // Arrange
            mockStore.sharpnessMode$ = of(SharpnessMode.PixelRatioFXAA)

            // Act & Assert
            service.sharpnessMode$().subscribe(value => {
                expect(value).toBe(SharpnessMode.PixelRatioFXAA)
                done()
            })
        })

        it("should return Observable from store with PixelRatioAA", done => {
            // Arrange
            mockStore.sharpnessMode$ = of(SharpnessMode.PixelRatioAA)

            // Act & Assert
            service.sharpnessMode$().subscribe(value => {
                expect(value).toBe(SharpnessMode.PixelRatioAA)
                done()
            })
        })
    })

    describe("setSharpnessMode", () => {
        it("should delegate to store with Standard", () => {
            // Arrange & Act
            service.setSharpnessMode(SharpnessMode.Standard)

            // Assert
            expect(mockStore.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.Standard)
        })

        it("should delegate to store with PixelRatioFXAA", () => {
            // Arrange & Act
            service.setSharpnessMode(SharpnessMode.PixelRatioFXAA)

            // Assert
            expect(mockStore.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.PixelRatioFXAA)
        })

        it("should delegate to store with PixelRatioAA", () => {
            // Arrange & Act
            service.setSharpnessMode(SharpnessMode.PixelRatioAA)

            // Assert
            expect(mockStore.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.PixelRatioAA)
        })
    })
})
