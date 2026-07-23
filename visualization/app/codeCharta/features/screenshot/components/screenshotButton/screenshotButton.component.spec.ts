import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import hotkeys from "hotkeys-js"
import { BehaviorSubject } from "rxjs"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { SCREENSHOT_CAPTURE } from "../../screenshotCapture"
import { ScreenshotButtonComponent } from "./screenshotButton.component"

const HOTKEY_TO_FILE = "Ctrl+Alt+S"
const HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"

describe("ScreenshotButtonComponent (toolbox)", () => {
    let isClipboardEnabled$: BehaviorSubject<boolean>
    let capture: {
        makeScreenshotToFile: jest.Mock
        makeScreenshotToClipboard: jest.Mock
        isWriteToClipboardAllowed: boolean
        subject: string
        isCaptureAvailable: () => boolean
    }

    function configure(
        options: {
            isClipboardEnabled?: boolean
            isWriteToClipboardAllowed?: boolean
            isCaptureAvailable?: boolean
            activeView?: ViewId
        } = {}
    ) {
        const { isClipboardEnabled = false, isWriteToClipboardAllowed = true, isCaptureAvailable = true, activeView = "metrics" } = options
        isClipboardEnabled$ = new BehaviorSubject<boolean>(isClipboardEnabled)
        capture = {
            makeScreenshotToFile: jest.fn().mockResolvedValue(undefined),
            makeScreenshotToClipboard: jest.fn().mockResolvedValue(undefined),
            isWriteToClipboardAllowed,
            subject: "map",
            isCaptureAvailable: signal(isCaptureAvailable).asReadonly()
        }

        TestBed.configureTestingModule({
            imports: [ScreenshotButtonComponent],
            providers: [
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => isClipboardEnabled$ } },
                { provide: SCREENSHOT_CAPTURE, useValue: capture },
                { provide: ActiveViewStore, useValue: { currentView: () => activeView } }
            ]
        })
    }

    function renderButton(view: ViewId = "metrics") {
        return render(ScreenshotButtonComponent, { inputs: { view } })
    }

    afterEach(() => {
        hotkeys.unbind(HOTKEY_TO_FILE)
        hotkeys.unbind(HOTKEY_TO_CLIPBOARD)
        jest.clearAllMocks()
    })

    it("should call makeScreenshotToClipboard when clipboard mode is on and clipboard is allowed", async () => {
        // Arrange
        configure({ isClipboardEnabled: true, isWriteToClipboardAllowed: true })
        await renderButton()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(capture.makeScreenshotToClipboard).toHaveBeenCalledTimes(1)
        expect(capture.makeScreenshotToFile).not.toHaveBeenCalled()
    })

    it("should call makeScreenshotToFile when clipboard mode is off", async () => {
        // Arrange
        configure({ isClipboardEnabled: false, isWriteToClipboardAllowed: true })
        await renderButton()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Screenshot" }))

        // Assert
        expect(capture.makeScreenshotToFile).toHaveBeenCalledTimes(1)
        expect(capture.makeScreenshotToClipboard).not.toHaveBeenCalled()
    })

    it("should call makeScreenshotToFile when clipboard mode is on but clipboard is not allowed", async () => {
        // Arrange
        configure({ isClipboardEnabled: true, isWriteToClipboardAllowed: false })
        await renderButton()

        // Act
        const button = screen.getByRole("button", { name: "Screenshot" })
        // Even though button is disabled, programmatic call should fall through to file path
        await userEvent.click(button, { pointerEventsCheck: 0 } as never)

        // Assert
        // Disabled buttons cannot be clicked, so neither service should be called
        expect(capture.makeScreenshotToClipboard).not.toHaveBeenCalled()
        expect(capture.makeScreenshotToFile).not.toHaveBeenCalled()
        expect((button as HTMLButtonElement).disabled).toBe(true)
    })

    it("should disable the button when there is nothing to capture", async () => {
        // Arrange
        configure({ isCaptureAvailable: false })

        // Act
        await renderButton()

        // Assert
        const button = screen.getByRole("button", { name: "Screenshot" }) as HTMLButtonElement
        expect(button.disabled).toBe(true)
        expect(button.title).toBe("There is no map to capture")
    })

    it("should name the capture subject in the tooltip", async () => {
        // Arrange
        configure()
        capture.subject = "word cloud"

        // Act
        await renderButton("domain")

        // Assert
        expect(screen.getByRole("button", { name: "Screenshot" }).title).toContain("Take a screenshot of the word cloud")
    })

    it("should take a screenshot on Ctrl+Alt+S when its own view is active", async () => {
        // Arrange
        configure({ activeView: "domain" })
        await renderButton("domain")

        // Act
        hotkeys.trigger(HOTKEY_TO_FILE)

        // Assert
        expect(capture.makeScreenshotToFile).toHaveBeenCalledTimes(1)
    })

    it("should copy to clipboard on Ctrl+Alt+F when its own view is active", async () => {
        // Arrange
        configure({ activeView: "domain" })
        await renderButton("domain")

        // Act
        hotkeys.trigger(HOTKEY_TO_CLIPBOARD)

        // Assert
        expect(capture.makeScreenshotToClipboard).toHaveBeenCalledTimes(1)
    })

    it("should ignore the hotkeys when another view is on screen", async () => {
        // Arrange: the views are kept alive, so this button exists while the other view is shown
        configure({ activeView: "metrics" })
        await renderButton("domain")

        // Act
        hotkeys.trigger(HOTKEY_TO_FILE)
        hotkeys.trigger(HOTKEY_TO_CLIPBOARD)

        // Assert
        expect(capture.makeScreenshotToFile).not.toHaveBeenCalled()
        expect(capture.makeScreenshotToClipboard).not.toHaveBeenCalled()
    })

    it("should ignore the hotkeys when there is nothing to capture", async () => {
        // Arrange
        configure({ activeView: "domain", isCaptureAvailable: false })
        await renderButton("domain")

        // Act
        hotkeys.trigger(HOTKEY_TO_FILE)

        // Assert
        expect(capture.makeScreenshotToFile).not.toHaveBeenCalled()
    })

    it("should unbind only its own hotkey handlers on destroy", async () => {
        // Arrange
        configure()
        const { fixture } = await render(ScreenshotButtonComponent, { inputs: { view: "metrics" } })
        const unbindSpy = jest.spyOn(hotkeys, "unbind")
        expect(hotkeys.getAllKeyCodes().length).toBeGreaterThan(0)

        // Act
        fixture.destroy()

        // Assert: the handler is passed along, so a sibling button keeps its binding
        expect(unbindSpy).toHaveBeenCalledWith("Ctrl+Alt+S", expect.any(Function))
        expect(unbindSpy).toHaveBeenCalledWith("Ctrl+Alt+F", expect.any(Function))
    })
})
