import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { screenshotToClipboardEnabledSelector } from "../selectors/globalSettings.selectors"
import { setScreenshotToClipboardEnabled } from "../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"

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
