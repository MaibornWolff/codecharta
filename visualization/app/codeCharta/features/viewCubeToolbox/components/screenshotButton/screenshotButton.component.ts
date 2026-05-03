import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import hotkeys from "hotkeys-js"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { ScreenshotService } from "../../services/screenshot.service"

const SCREENSHOT_HOTKEY_TO_FILE = "Ctrl+Alt+S"
const SCREENSHOT_HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"

@Component({
    selector: "cc-toolbox-screenshot-button",
    templateUrl: "./screenshotButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenshotButtonComponent implements OnInit, OnDestroy {
    private readonly screenshotService = inject(ScreenshotService)
    private readonly globalSettingsFacade = inject(GlobalSettingsFacade)

    protected readonly isClipboardMode = toSignal(this.globalSettingsFacade.screenshotToClipboardEnabled$(), { requireSync: true })

    protected readonly tooltip = computed(() => {
        if (this.isClipboardMode()) {
            return this.screenshotService.isWriteToClipboardAllowed
                ? `Take a screenshot of the map with ${SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard) or ${SCREENSHOT_HOTKEY_TO_FILE} (save as file)`
                : "Firefox does not support copying to clipboard"
        }
        return `Take a screenshot of the map with ${SCREENSHOT_HOTKEY_TO_FILE} (save as file) or ${SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard)`
    })

    protected readonly isDisabled = computed(() => this.isClipboardMode() && !this.screenshotService.isWriteToClipboardAllowed)

    ngOnInit() {
        hotkeys(SCREENSHOT_HOTKEY_TO_FILE, () => {
            this.screenshotService.makeScreenshotToFile()
        })
        hotkeys(SCREENSHOT_HOTKEY_TO_CLIPBOARD, () => {
            this.screenshotService.makeScreenshotToClipboard()
        })
    }

    ngOnDestroy() {
        hotkeys.unbind(SCREENSHOT_HOTKEY_TO_FILE)
        hotkeys.unbind(SCREENSHOT_HOTKEY_TO_CLIPBOARD)
    }

    handleClick() {
        if (this.isClipboardMode() && this.screenshotService.isWriteToClipboardAllowed) {
            this.screenshotService.makeScreenshotToClipboard()
            return
        }
        this.screenshotService.makeScreenshotToFile()
    }
}
