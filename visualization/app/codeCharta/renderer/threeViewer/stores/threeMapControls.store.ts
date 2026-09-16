import { Injectable } from "@angular/core"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"

@Injectable({ providedIn: "root" })
export class ThreeMapControlsStore {
    constructor(private readonly preferencesReadWindow: PreferencesReadWindow) {}

    getCenterMapZoom(): number {
        return this.preferencesReadWindow.getPreferences().centerMapZoom
    }
}
