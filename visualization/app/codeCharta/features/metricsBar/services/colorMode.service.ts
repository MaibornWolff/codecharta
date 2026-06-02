import { Injectable } from "@angular/core"
import { ColorMode } from "../../../codeCharta.model"
import { ColorModeStore } from "../stores/colorMode.store"

@Injectable({
    providedIn: "root"
})
export class ColorModeService {
    constructor(private readonly colorModeStore: ColorModeStore) {}

    colorMode$() {
        return this.colorModeStore.colorMode$
    }

    setColorMode(value: ColorMode) {
        this.colorModeStore.setColorMode(value)
    }
}
