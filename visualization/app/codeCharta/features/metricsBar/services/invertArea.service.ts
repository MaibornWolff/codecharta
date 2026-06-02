import { Injectable } from "@angular/core"
import { InvertAreaStore } from "../stores/invertArea.store"

@Injectable({
    providedIn: "root"
})
export class InvertAreaService {
    constructor(private readonly invertAreaStore: InvertAreaStore) {}

    invertArea$() {
        return this.invertAreaStore.invertArea$
    }

    setInvertArea(value: boolean) {
        this.invertAreaStore.setInvertArea(value)
    }
}
