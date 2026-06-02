import { Injectable } from "@angular/core"
import { ShowOnlyBuildingsWithEdgesStore } from "../stores/showOnlyBuildingsWithEdges.store"

@Injectable({
    providedIn: "root"
})
export class ShowOnlyBuildingsWithEdgesService {
    constructor(private readonly showOnlyBuildingsWithEdgesStore: ShowOnlyBuildingsWithEdgesStore) {}

    showOnlyBuildingsWithEdges$() {
        return this.showOnlyBuildingsWithEdgesStore.showOnlyBuildingsWithEdges$
    }

    setShowOnlyBuildingsWithEdges(value: boolean) {
        this.showOnlyBuildingsWithEdgesStore.setShowOnlyBuildingsWithEdges(value)
    }
}
