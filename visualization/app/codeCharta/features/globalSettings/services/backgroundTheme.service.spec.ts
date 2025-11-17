import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { BackgroundThemeService } from "./backgroundTheme.service"
import { BackgroundThemeStore } from "../stores/backgroundTheme.store"

describe("BackgroundThemeService", () => {
    let service: BackgroundThemeService
    let mockStore: jest.Mocked<Partial<BackgroundThemeStore>>

    beforeEach(() => {
        mockStore = {
            isWhiteBackground$: of(false),
            setWhiteBackground: jest.fn()
        }

        TestBed.configureTestingModule({
            providers: [BackgroundThemeService, { provide: BackgroundThemeStore, useValue: mockStore }]
        })

        service = TestBed.inject(BackgroundThemeService)
    })

    describe("isWhiteBackground$", () => {
        it("should return Observable from store", done => {
            // Arrange
            mockStore.isWhiteBackground$ = of(true)

            // Act & Assert
            service.isWhiteBackground$().subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should return false from store when background is dark", done => {
            // Arrange
            mockStore.isWhiteBackground$ = of(false)

            // Act & Assert
            service.isWhiteBackground$().subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setWhiteBackground", () => {
        it("should delegate to store with true", () => {
            // Arrange & Act
            service.setWhiteBackground(true)

            // Assert
            expect(mockStore.setWhiteBackground).toHaveBeenCalledWith(true)
        })

        it("should delegate to store with false", () => {
            // Arrange & Act
            service.setWhiteBackground(false)

            // Assert
            expect(mockStore.setWhiteBackground).toHaveBeenCalledWith(false)
        })
    })
})
