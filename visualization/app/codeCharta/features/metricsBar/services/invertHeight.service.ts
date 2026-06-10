import { Injectable } from "@angular/core"
import { InvertHeightStore } from "../stores/invertHeight.store"

@Injectable({
    providedIn: "root"
})
export class InvertHeightService {
    constructor(private readonly invertHeightStore: InvertHeightStore) {}

    invertHeight$() {
        return this.invertHeightStore.invertHeight$
    }

    setInvertHeight(value: boolean) {
        this.invertHeightStore.setInvertHeight(value)
    }
}
