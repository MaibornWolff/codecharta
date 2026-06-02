import { Injectable } from "@angular/core"
import { EdgeHeightStore } from "../stores/edgeHeight.store"

@Injectable({
    providedIn: "root"
})
export class EdgeHeightService {
    constructor(private readonly edgeHeightStore: EdgeHeightStore) {}

    edgeHeight$() {
        return this.edgeHeightStore.edgeHeight$
    }

    setEdgeHeight(value: number) {
        this.edgeHeightStore.setEdgeHeight(value)
    }
}
