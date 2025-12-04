import { Injectable } from "@angular/core"
import { ColorMode } from "../../../codeCharta.model"
import { Print3DStore } from "../stores/3dPrint.store"

@Injectable({
    providedIn: "root"
})
export class Print3DService {
    constructor(private readonly print3DStore: Print3DStore) {}

    areaMetric$() {
        return this.print3DStore.areaMetric$
    }

    heightMetric$() {
        return this.print3DStore.heightMetric$
    }

    colorMetric$() {
        return this.print3DStore.colorMetric$
    }

    colorRange$() {
        return this.print3DStore.colorRange$
    }

    colorMode$() {
        return this.print3DStore.colorMode$
    }

    attributeDescriptors$() {
        return this.print3DStore.attributeDescriptors$
    }

    blacklist$() {
        return this.print3DStore.blacklist$
    }

    files$() {
        return this.print3DStore.files$
    }

    setColorMode(value: ColorMode) {
        this.print3DStore.setColorMode(value)
    }
}
