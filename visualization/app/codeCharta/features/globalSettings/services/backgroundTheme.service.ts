import { Injectable } from "@angular/core"
import { BackgroundThemeStore } from "../stores/backgroundTheme.store"

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
