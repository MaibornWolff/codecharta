import { TestBed } from "@angular/core/testing"
import { CopyToClipboardService } from "./copyToClipboard.service"

describe("CopyToClipboardService", () => {
    let writeText: jest.Mock

    beforeEach(() => {
        writeText = jest.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })
        jest.useFakeTimers()
        TestBed.configureTestingModule({ providers: [CopyToClipboardService] })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should write the text to the clipboard and flag copied", async () => {
        // Arrange
        const service = TestBed.inject(CopyToClipboardService)

        // Act
        await service.copy("some/path")

        // Assert
        expect(writeText).toHaveBeenCalledWith("some/path")
        expect(service.copied()).toBe(true)
    })

    it("should clear the copied flag once the feedback delay elapses", async () => {
        // Arrange
        const service = TestBed.inject(CopyToClipboardService)

        // Act
        await service.copy("some/path")
        jest.advanceTimersByTime(1500)

        // Assert
        expect(service.copied()).toBe(false)
    })
})
