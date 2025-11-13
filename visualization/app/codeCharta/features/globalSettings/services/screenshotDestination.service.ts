import { Injectable } from "@angular/core"
import { ScreenshotDestinationStore } from "../stores/screenshotDestination.store"

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
