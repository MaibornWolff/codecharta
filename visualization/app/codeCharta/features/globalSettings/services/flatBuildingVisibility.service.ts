import { Injectable } from "@angular/core"
import { FlatBuildingVisibilityStore } from "../stores/flatBuildingVisibility.store"

@Injectable({
    providedIn: "root"
})
export class FlatBuildingVisibilityService {
    constructor(private readonly flatBuildingVisibilityStore: FlatBuildingVisibilityStore) {}

    hideFlatBuildings$() {
        return this.flatBuildingVisibilityStore.hideFlatBuildings$
    }

    setHideFlatBuildings(value: boolean) {
        this.flatBuildingVisibilityStore.setHideFlatBuildings(value)
    }
}
