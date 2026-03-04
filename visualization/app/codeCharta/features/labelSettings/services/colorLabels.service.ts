import { Injectable } from "@angular/core"
import { ColorLabelOptions } from "../../../codeCharta.model"
import { ColorLabelsStore } from "../stores/colorLabels.store"

@Injectable({
    providedIn: "root"
})
export class ColorLabelsService {
    constructor(private readonly colorLabelsStore: ColorLabelsStore) {}

    colorLabels$() {
        return this.colorLabelsStore.colorLabels$
    }

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.colorLabelsStore.setColorLabels(value)
    }
}
