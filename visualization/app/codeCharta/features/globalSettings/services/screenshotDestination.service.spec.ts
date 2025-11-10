import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { ScreenshotDestinationService } from "./screenshotDestination.service"
import { ScreenshotDestinationStore } from "../stores/screenshotDestination.store"

describe("ScreenshotDestinationService", () => {
    let service: ScreenshotDestinationService
    let mockStore: jest.Mocked<ScreenshotDestinationStore>

    beforeEach(() => {
        mockStore = {
            screenshotToClipboardEnabled$: of(false),
            setScreenshotToClipboard: jest.fn()
        } as any

        TestBed.configureTestingModule({
            providers: [ScreenshotDestinationService, { provide: ScreenshotDestinationStore, useValue: mockStore }]
        })

        service = TestBed.inject(ScreenshotDestinationService)
    })

    describe("screenshotToClipboardEnabled$", () => {
        it("should return Observable from store", done => {
            // Arrange
            mockStore.screenshotToClipboardEnabled$ = of(true)

            // Act & Assert
            service.screenshotToClipboardEnabled$().subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should return false from store when clipboard disabled", done => {
            // Arrange
            mockStore.screenshotToClipboardEnabled$ = of(false)

            // Act & Assert
            service.screenshotToClipboardEnabled$().subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setScreenshotToClipboard", () => {
        it("should delegate to store with true", () => {
            // Arrange & Act
            service.setScreenshotToClipboard(true)

            // Assert
            expect(mockStore.setScreenshotToClipboard).toHaveBeenCalledWith(true)
        })

        it("should delegate to store with false", () => {
            // Arrange & Act
            service.setScreenshotToClipboard(false)

            // Assert
            expect(mockStore.setScreenshotToClipboard).toHaveBeenCalledWith(false)
        })
    })
})
