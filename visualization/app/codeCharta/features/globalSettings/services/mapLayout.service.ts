import { Injectable } from "@angular/core"
import { LayoutAlgorithm } from "../../../codeCharta.model"
import { MapLayoutStore } from "../stores/mapLayout.store"

/**
 * Service for map layout settings.
 * Controls how the code map is visually arranged (algorithm and complexity).
 */
@Injectable({
    providedIn: "root"
})
export class MapLayoutService {
    constructor(private readonly mapLayoutStore: MapLayoutStore) {}

    layoutAlgorithm$() {
        return this.mapLayoutStore.layoutAlgorithm$
    }

    maxTreeMapFiles$() {
        return this.mapLayoutStore.maxTreeMapFiles$
    }

    setLayoutAlgorithm(value: LayoutAlgorithm) {
        this.mapLayoutStore.setLayoutAlgorithm(value)
    }

    setMaxTreeMapFiles(value: number) {
        this.mapLayoutStore.setMaxTreeMapFiles(value)
    }
}
