import { Injectable } from "@angular/core"
import { ResetSettingsButtonStore } from "../stores/resetSettingsButton.store"

@Injectable({
    providedIn: "root"
})
export class ResetSettingsButtonService {
    constructor(private readonly resetSettingsButtonStore: ResetSettingsButtonStore) {}

    resetSettings(settingsKeys: string[]) {
        this.resetSettingsButtonStore.resetSettings(settingsKeys)
    }
}
