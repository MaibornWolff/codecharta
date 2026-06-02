import { Injectable } from "@angular/core"
import { DynamicSettingsStore } from "../stores/dynamicSettings.store"

@Injectable({
    providedIn: "root"
})
export class DynamicSettingsService {
    constructor(private readonly dynamicSettingsStore: DynamicSettingsStore) {}

    dynamicSettings$() {
        return this.dynamicSettingsStore.dynamicSettings$
    }
}
