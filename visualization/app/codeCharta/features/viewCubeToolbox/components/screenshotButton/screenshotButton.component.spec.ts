import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import hotkeys from "hotkeys-js"
import { BehaviorSubject } from "rxjs"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { ScreenshotService } from "../../services/screenshot.service"
import { ScreenshotButtonComponent } from "./screenshotButton.component"

describe("ScreenshotButtonComponent (toolbox)", () => {
    let isClipboardEnabled$: BehaviorSubject<boolean>
    let screenshotService: { makeScreenshotToFile: jest.Mock; makeScreenshotToClipboard: jest.Mock; isWriteToClipboardAllowed: boolean }

    function configure(options: { isClipboardEnabled?: boolean; isWriteToClipboardAllowed?: boolean } = {}) {
        const { isClipboardEnabled = false, isWriteToClipboardAllowed = true } = options
        isClipboardEnabled$ = new BehaviorSubject<boolean>(isClipboardEnabled)
        screenshotService = {
            makeScreenshotToFile: jest.fn().mockResolvedValue(undefined),
            makeScreenshotToClipboard: jest.fn().mockResolvedValue(undefined),
            isWriteToClipboardAllowed
        }

        TestBed.configureTestingModule({
            imports: [ScreenshotButtonComponent],
            providers: [
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => isClipboardEnabled$ } },
                { provide: ScreenshotService, useValue: screenshotService }
            ]
        })
    }

    afterEach(() => {
        hotkeys.unbind("Ctrl+Alt+S")
        hotkeys.unbind("Ctrl+Alt+F")
        jest.clearAllMocks()
    })

    it("should call makeScreenshotToClipboard when clipboard mode is on and clipboard is allowed", async () => {
        // Arrange
        configure({ isClipboardEnabled: true, isWriteToClipboardAllowed: true })
        await render(ScreenshotButtonComponent)

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(screenshotService.makeScreenshotToClipboard).toHaveBeenCalledTimes(1)
        expect(screenshotService.makeScreenshotToFile).not.toHaveBeenCalled()
    })

    it("should call makeScreenshotToFile when clipboard mode is off", async () => {
        // Arrange
        configure({ isClipboardEnabled: false, isWriteToClipboardAllowed: true })
        await render(ScreenshotButtonComponent)

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(screenshotService.makeScreenshotToFile).toHaveBeenCalledTimes(1)
        expect(screenshotService.makeScreenshotToClipboard).not.toHaveBeenCalled()
    })

    it("should call makeScreenshotToFile when clipboard mode is on but clipboard is not allowed", async () => {
        // Arrange
        configure({ isClipboardEnabled: true, isWriteToClipboardAllowed: false })
        await render(ScreenshotButtonComponent)

        // Act
        const button = screen.getByRole("button", { name: "Screenshot" })
        // Even though button is disabled, programmatic call should fall through to file path
        await userEvent.click(button, { pointerEventsCheck: 0 } as never)

        // Assert
        // Disabled buttons cannot be clicked, so neither service should be called
        expect(screenshotService.makeScreenshotToClipboard).not.toHaveBeenCalled()
        expect(screenshotService.makeScreenshotToFile).not.toHaveBeenCalled()
        expect((button as HTMLButtonElement).disabled).toBe(true)
    })

    it("should register Ctrl+Alt+S and Ctrl+Alt+F hotkeys on init and unbind on destroy", async () => {
        // Arrange
        configure()
        const { fixture } = await render(ScreenshotButtonComponent)
        const unbindSpy = jest.spyOn(hotkeys, "unbind")

        // Act / Assert: hotkeys present after init
        expect(hotkeys.getAllKeyCodes().length).toBeGreaterThan(0)

        // Act: destroy
        fixture.destroy()

        // Assert: unbind was called for both hotkeys
        expect(unbindSpy).toHaveBeenCalledWith("Ctrl+Alt+S")
        expect(unbindSpy).toHaveBeenCalledWith("Ctrl+Alt+F")
    })
})
