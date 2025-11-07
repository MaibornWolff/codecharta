import { Injectable } from "@angular/core"
import { BackgroundThemeStore } from "../stores/backgroundTheme.store"

/**
 * Service for background theme settings.
 * Controls the background appearance (white or dark).
 */
@Injectable({
    providedIn: "root"
})
export class BackgroundThemeService {
    constructor(private readonly backgroundThemeStore: BackgroundThemeStore) {}

    isWhiteBackground$() {
        return this.backgroundThemeStore.isWhiteBackground$
    }

    setWhiteBackground(value: boolean) {
        this.backgroundThemeStore.setWhiteBackground(value)
    }
}
