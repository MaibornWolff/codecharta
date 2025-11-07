import { Injectable } from "@angular/core"
import { ScreenshotDestinationStore } from "../stores/screenshotDestination.store"

/**
 * Service for screenshot destination settings.
 * Controls whether screenshots go to clipboard or are saved as files.
 */
@Injectable({
    providedIn: "root"
})
export class ScreenshotDestinationService {
    constructor(private readonly screenshotDestinationStore: ScreenshotDestinationStore) {}

    screenshotToClipboardEnabled$() {
        return this.screenshotDestinationStore.screenshotToClipboardEnabled$
    }

    setScreenshotToClipboard(value: boolean) {
        this.screenshotDestinationStore.setScreenshotToClipboard(value)
    }
}
