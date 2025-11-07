import { Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"
import { debounce } from "../../../../../util/debounce"
import { MapLayoutService } from "../../../services/mapLayout.service"

@Component({
    selector: "cc-map-layout-selection",
    templateUrl: "./mapLayoutSelection.component.html",
    imports: []
})
export class MapLayoutSelectionComponent {
    layoutAlgorithms = Object.values(LayoutAlgorithm)
    layoutAlgorithm = toSignal(this.mapLayoutService.layoutAlgorithm$(), { requireSync: true })
    maxTreeMapFiles = toSignal(this.mapLayoutService.maxTreeMapFiles$(), { requireSync: true })

    showTreeMapSlider = computed(() => this.layoutAlgorithm() === "TreeMapStreet")

    constructor(private readonly mapLayoutService: MapLayoutService) {}

    handleSelectedLayoutAlgorithmChanged(event: Event) {
        const value = (event.target as HTMLSelectElement).value as LayoutAlgorithm
        this.mapLayoutService.setLayoutAlgorithm(value)
    }

    handleMaxTreeMapFilesRangeInput(event: Event) {
        const value = Number((event.target as HTMLInputElement).value)
        this.debouncedSetMaxTreeMapFiles(value)
    }

    handleMaxTreeMapFilesNumberInput(event: Event) {
        const input = event.target as HTMLInputElement
        const value = Number(input.value)

        if (value >= 1 && value <= 1000) {
            this.debouncedSetMaxTreeMapFiles(value)
        }
    }

    private readonly debouncedSetMaxTreeMapFiles = debounce((value: number) => {
        this.mapLayoutService.setMaxTreeMapFiles(value)
    }, 400)
}
