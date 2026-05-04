import { Injectable } from "@angular/core"
import { LabelSizeStore } from "../stores/labelSize.store"

@Injectable({
    providedIn: "root"
})
export class LabelSizeService {
    constructor(private readonly labelSizeStore: LabelSizeStore) {}

    labelSize$() {
        return this.labelSizeStore.labelSize$
    }

    setLabelSize(value: number) {
        this.labelSizeStore.setLabelSize(value)
    }
}
