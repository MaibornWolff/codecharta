import { Injectable } from "@angular/core"
import { MarginStore } from "../stores/margin.store"

@Injectable({
    providedIn: "root"
})
export class MarginService {
    constructor(private readonly marginStore: MarginStore) {}

    margin$() {
        return this.marginStore.margin$
    }

    setMargin(value: number) {
        this.marginStore.setMargin(value)
    }
}
