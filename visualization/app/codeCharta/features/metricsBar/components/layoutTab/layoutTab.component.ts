import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { SettingsPopoverShellComponent, SliderNumberInputComponent } from "../../../shared/facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { LayoutGlyphComponent } from "./layoutGlyph.component"

const MIN_RADIAL_LEVELS = 1
const MAX_RADIAL_LEVELS = 10
const RADIAL_LAYOUTS = new Set([LayoutAlgorithm.Sunburst, LayoutAlgorithm.RadialTreeMap])

const LAYOUT_DESCRIPTIONS: Record<LayoutAlgorithm, string> = {
    [LayoutAlgorithm.SquarifiedTreeMap]: "Folders nest inside each other and every bit of floor is used.",
    [LayoutAlgorithm.StreetMap]: "Folders become streets, files line up along them.",
    [LayoutAlgorithm.TreeMapStreet]: "Streets for the upper folders, treemaps near the files.",
    [LayoutAlgorithm.Sunburst]: "Folders as rings around the centre, drawn flat without heights.",
    [LayoutAlgorithm.RadialTreeMap]: "A band per folder level, each folder filled with a treemap of its contents."
}

@Component({
    selector: "cc-layout-tab",
    templateUrl: "./layoutTab.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "absolute bottom-full left-4" },
    imports: [LayoutGlyphComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class LayoutTabComponent {
    private readonly writeStore = inject(MetricsBarWriteStore)

    readonly popoverId = "metrics-bar-layout-picker"
    readonly anchorName = "metrics-bar-layout-tab"
    readonly layoutOptions = Object.values(LayoutAlgorithm).map(layout => ({ layout, description: LAYOUT_DESCRIPTIONS[layout] }))

    readonly layoutAlgorithm = toSignal(inject(MapStateReadWindow).layoutAlgorithm$, { requireSync: true })
    readonly maxTreeMapFiles = toSignal(inject(PreferencesReadWindow).maxTreeMapFiles$, { requireSync: true })
    readonly showMaxTreeMapFiles = computed(() => this.layoutAlgorithm() === LayoutAlgorithm.TreeMapStreet)
    readonly radialLevels = toSignal(inject(PreferencesReadWindow).radialLevels$, { requireSync: true })
    readonly showRadialLevels = computed(() => RADIAL_LAYOUTS.has(this.layoutAlgorithm()))
    readonly minRadialLevels = MIN_RADIAL_LEVELS
    readonly maxRadialLevels = MAX_RADIAL_LEVELS

    selectLayout(layout: LayoutAlgorithm) {
        this.writeStore.setLayoutAlgorithm(layout)
    }

    setMaxTreeMapFiles(value: number) {
        this.writeStore.setMaxTreeMapFiles(value)
    }

    setRadialLevels(value: number) {
        this.writeStore.setRadialLevels(value)
    }
}
