import { Injectable } from "@angular/core"
import { Print3DService } from "./services/3dPrint.service"
import { ColorMode } from "../../codeCharta.model"

@Injectable({
    providedIn: "root"
})
export class Print3DFacade {
    constructor(private readonly print3DService: Print3DService) {}

    areaMetric$() {
        return this.print3DService.areaMetric$()
    }

    heightMetric$() {
        return this.print3DService.heightMetric$()
    }

    colorMetric$() {
        return this.print3DService.colorMetric$()
    }

    colorRange$() {
        return this.print3DService.colorRange$()
    }

    colorMode$() {
        return this.print3DService.colorMode$()
    }

    attributeDescriptors$() {
        return this.print3DService.attributeDescriptors$()
    }

    blacklist$() {
        return this.print3DService.blacklist$()
    }

    files$() {
        return this.print3DService.files$()
    }

    setColorMode(value: ColorMode) {
        this.print3DService.setColorMode(value)
    }
}
