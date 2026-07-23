import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, OnInit } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import hotkeys from "hotkeys-js"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { SCREENSHOT_CAPTURE } from "../../screenshotCapture"

const SCREENSHOT_HOTKEY_TO_FILE = "Ctrl+Alt+S"
const SCREENSHOT_HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"

@Component({
    selector: "cc-toolbox-screenshot-button",
    templateUrl: "./screenshotButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenshotButtonComponent implements OnInit, OnDestroy {
    private readonly capture = inject(SCREENSHOT_CAPTURE)
    private readonly globalSettingsFacade = inject(GlobalSettingsFacade)
    private readonly activeViewStore = inject(ActiveViewStore)

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
            this.capture.makeScreenshotToFile()
        }
    }
    private readonly screenshotToClipboardHotkeyHandler = () => {
        if (this.isCapturable() && this.capture.isWriteToClipboardAllowed) {
            this.capture.makeScreenshotToClipboard()
        }
    }

    ngOnInit() {
        hotkeys(SCREENSHOT_HOTKEY_TO_FILE, this.screenshotToFileHotkeyHandler)
        hotkeys(SCREENSHOT_HOTKEY_TO_CLIPBOARD, this.screenshotToClipboardHotkeyHandler)
    }

    ngOnDestroy() {
        hotkeys.unbind(SCREENSHOT_HOTKEY_TO_FILE, this.screenshotToFileHotkeyHandler)
        hotkeys.unbind(SCREENSHOT_HOTKEY_TO_CLIPBOARD, this.screenshotToClipboardHotkeyHandler)
    }

    handleClick() {
        if (this.isClipboardMode() && this.capture.isWriteToClipboardAllowed) {
            this.capture.makeScreenshotToClipboard()
            return
        }
        this.capture.makeScreenshotToFile()
    }

    private isCapturable(): boolean {
        return this.activeViewStore.currentView() === this.view() && this.capture.isCaptureAvailable()
    }
}
