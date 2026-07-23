import { InjectionToken, Signal } from "@angular/core"

export interface ScreenshotCapture {
    readonly isWriteToClipboardAllowed: boolean

    readonly subject: string

    readonly isCaptureAvailable: Signal<boolean>

    makeScreenshotToFile(): Promise<void>

    makeScreenshotToClipboard(): Promise<void>
}

export const SCREENSHOT_CAPTURE = new InjectionToken<ScreenshotCapture>("SCREENSHOT_CAPTURE")
