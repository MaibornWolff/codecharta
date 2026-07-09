import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setScreenshotToClipboardEnabled } from "../../../stores/preferences/preferences.write.facade"
import { screenshotToClipboardEnabledSelector } from "../selectors/globalSettings.selectors"

@Injectable({
    providedIn: "root"
})
export class ScreenshotDestinationStore {
    constructor(private readonly store: Store<CcState>) {}

    screenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)

    setScreenshotToClipboard(value: boolean) {
        this.store.dispatch(setScreenshotToClipboardEnabled({ value }))
    }
}
