import { InjectionToken, Signal } from "@angular/core"

export interface ScreenshotCapture {
    readonly isWriteToClipboardAllowed: boolean

    readonly subject: string

    readonly isCaptureAvailable: Signal<boolean>

    /** Rejects when no screenshot was saved, so the caller can tell the user. */
    makeScreenshotToFile(): Promise<void>

    /** Rejects when no screenshot reached the clipboard, so the caller can tell the user. */
    makeScreenshotToClipboard(): Promise<void>
}

export const SCREENSHOT_CAPTURE = new InjectionToken<ScreenshotCapture>("SCREENSHOT_CAPTURE")
