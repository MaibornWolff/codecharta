import { Injectable } from "@angular/core"
import { ResetSettingsStore } from "../stores/resetSettings.store"

@Injectable({
    providedIn: "root"
})
export class ResetSettingsService {
    constructor(private readonly resetSettingsStore: ResetSettingsStore) {}

    resetSettings(settingsKeys: string[]) {
        this.resetSettingsStore.resetSettings(settingsKeys)
    }
}
