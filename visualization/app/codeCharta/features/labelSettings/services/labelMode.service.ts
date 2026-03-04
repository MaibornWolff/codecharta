import { Injectable } from "@angular/core"
import { LabelMode } from "../../../codeCharta.model"
import { LabelModeStore } from "../stores/labelMode.store"

@Injectable({
    providedIn: "root"
})
export class LabelModeService {
    constructor(private readonly labelModeStore: LabelModeStore) {}

    labelMode$() {
        return this.labelModeStore.labelMode$
    }

    setLabelMode(value: LabelMode) {
        this.labelModeStore.setLabelMode(value)
    }
}
