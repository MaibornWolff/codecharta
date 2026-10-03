import { ChangeDetectionStrategy, Component, computed, ErrorHandler, inject, input, OnDestroy, OnInit, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import hotkeys from "hotkeys-js"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { BarToolComponent } from "../../../shared/facade"
import { SCREENSHOT_CAPTURE } from "../../screenshotCapture"

const SCREENSHOT_HOTKEY_TO_FILE = "Ctrl+Alt+S"
const SCREENSHOT_HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"
const OUTCOME_FEEDBACK_MS = 1500

type ScreenshotOutcome = "copied" | "saved" | "failed"

const IDLE_APPEARANCE = { label: "Screenshot", icon: "fa fa-camera" }
const OUTCOME_APPEARANCE: Record<ScreenshotOutcome, typeof IDLE_APPEARANCE> = {
    copied: { label: "Copied!", icon: "fa fa-check" },
    saved: { label: "Saved!", icon: "fa fa-check" },
    failed: { label: "Screenshot failed", icon: "fa fa-exclamation-triangle text-error" }
}

@Component({
    selector: "cc-toolbox-screenshot-button",
    templateUrl: "./screenshotButton.component.html",
    imports: [BarToolComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenshotButtonComponent implements OnInit, OnDestroy {
    private readonly capture = inject(SCREENSHOT_CAPTURE)
    private readonly globalSettingsFacade = inject(GlobalSettingsFacade)
    private readonly activeViewStore = inject(ActiveViewStore)
    private readonly errorHandler = inject(ErrorHandler)

    private readonly outcome = signal<ScreenshotOutcome | null>(null)
    private outcomeResetTimeout?: ReturnType<typeof setTimeout>

    protected readonly appearance = computed(() => {
        const outcome = this.outcome()
        return outcome ? OUTCOME_APPEARANCE[outcome] : IDLE_APPEARANCE
    })
    protected readonly hasSucceeded = computed(() => this.outcome() === "copied" || this.outcome() === "saved")

    readonly view = input.required<ViewId>()

    protected readonly isClipboardMode = toSignal(this.globalSettingsFacade.screenshotToClipboardEnabled$(), { requireSync: true })

    protected readonly tooltip = computed(() => {
        const subject = this.capture.subject
        if (!this.capture.isCaptureAvailable()) {
            return `There is no ${subject} to capture`
        }
        if (this.isClipboardMode()) {
            return this.capture.isWriteToClipboardAllowed
                ? `Take a screenshot of the ${subject} with ${SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard) or ${SCREENSHOT_HOTKEY_TO_FILE} (save as file)`
                : "Firefox does not support copying to clipboard"
        }
        return `Take a screenshot of the ${subject} with ${SCREENSHOT_HOTKEY_TO_FILE} (save as file) or ${SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard)`
    })

    protected readonly isDisabled = computed(
        () => !this.capture.isCaptureAvailable() || (this.isClipboardMode() && !this.capture.isWriteToClipboardAllowed)
    )

    private readonly screenshotToFileHotkeyHandler = () => {
        if (this.isCapturable()) {
            this.saveToFile()
        }
    }
    private readonly screenshotToClipboardHotkeyHandler = () => {
        if (this.isCapturable() && this.capture.isWriteToClipboardAllowed) {
            this.copyToClipboard()
        }
    }

    ngOnInit() {
        hotkeys(SCREENSHOT_HOTKEY_TO_FILE, this.screenshotToFileHotkeyHandler)
        hotkeys(SCREENSHOT_HOTKEY_TO_CLIPBOARD, this.screenshotToClipboardHotkeyHandler)
    }

    ngOnDestroy() {
        hotkeys.unbind(SCREENSHOT_HOTKEY_TO_FILE, this.screenshotToFileHotkeyHandler)
        hotkeys.unbind(SCREENSHOT_HOTKEY_TO_CLIPBOARD, this.screenshotToClipboardHotkeyHandler)
        clearTimeout(this.outcomeResetTimeout)
    }

    handleClick() {
        if (this.isClipboardMode() && this.capture.isWriteToClipboardAllowed) {
            return this.copyToClipboard()
        }
        return this.saveToFile()
    }

    private copyToClipboard() {
        return this.captureAndShowOutcome("copied", () => this.capture.makeScreenshotToClipboard())
    }

    private saveToFile() {
        return this.captureAndShowOutcome("saved", () => this.capture.makeScreenshotToFile())
    }

    private async captureAndShowOutcome(outcomeOnSuccess: ScreenshotOutcome, takeScreenshot: () => Promise<void>) {
        try {
            await takeScreenshot()
            this.showOutcome(outcomeOnSuccess)
        } catch (error) {
            this.errorHandler.handleError(error)
            this.showOutcome("failed")
        }
    }

    private showOutcome(outcome: ScreenshotOutcome) {
        this.outcome.set(outcome)
        clearTimeout(this.outcomeResetTimeout)
        this.outcomeResetTimeout = setTimeout(() => this.outcome.set(null), OUTCOME_FEEDBACK_MS)
    }

    private isCapturable(): boolean {
        return this.activeViewStore.currentView() === this.view() && this.capture.isCaptureAvailable()
    }
}
