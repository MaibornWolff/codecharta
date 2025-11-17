import { Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { DisplayQualityService } from "../../../services/displayQuality.service"

@Component({
    selector: "cc-display-quality-selection",
    templateUrl: "./displayQualitySelection.component.html",
    imports: []
})
export class DisplayQualitySelectionComponent {
    sharpnessModes = Object.values(SharpnessMode)
    sharpnessMode = toSignal(this.displayQualityService.sharpnessMode$(), { requireSync: true })

    constructor(private readonly displayQualityService: DisplayQualityService) {}

    handleSelectedSharpnessModeChanged(event: Event) {
        const value = (event.target as HTMLSelectElement).value as SharpnessMode
        this.displayQualityService.setSharpnessMode(value)
    }
}
