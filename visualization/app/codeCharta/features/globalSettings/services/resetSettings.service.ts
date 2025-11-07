import { Injectable } from "@angular/core"
import { ResetSettingsStore } from "../stores/resetSettings.store"

/**
 * Service for resetting settings to their defaults.
 * Allows bulk reset of multiple settings at once.
 */
@Injectable({
    providedIn: "root"
})
export class ResetSettingsService {
    constructor(private readonly resetSettingsStore: ResetSettingsStore) {}

    resetSettings(settingsKeys: string[]) {
        this.resetSettingsStore.resetSettings(settingsKeys)
    }
}
