import { Component, AfterViewInit, computed, ElementRef, input, output, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MetricData } from "../../../../codeCharta.model"
import {
    getAvailableSectionKeys,
    Scenario,
    SCENARIO_SECTION_ICONS,
    SCENARIO_SECTION_LABELS,
    ScenarioSectionKey
} from "../../model/scenario.model"
import { ScenariosService } from "../../services/scenarios.service"
import { getMissingMetrics, hasMissingMetrics } from "../../services/getMissingMetrics"

@Component({
    selector: "cc-apply-scenario-dialog",
    templateUrl: "./applyScenarioDialog.component.html",
    imports: [FormsModule]
})
export class ApplyScenarioDialogComponent implements AfterViewInit {
    readonly scenario = input.required<Scenario>()
    readonly metricData = input.required<MetricData>()
    readonly closed = output<void>()

    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    readonly sectionLabels = SCENARIO_SECTION_LABELS
    readonly sectionIcons = SCENARIO_SECTION_ICONS

    readonly availableSectionKeys = computed(() => getAvailableSectionKeys(this.scenario()))

    readonly selectedSections = signal<Record<ScenarioSectionKey, boolean>>({
        metrics: true,
        colors: true,
        camera: true,
        filters: true,
        labelsAndFolders: true
    })

    readonly missingMetrics = computed(() => {
        const metrics = this.scenario().sections.metrics
        return metrics ? getMissingMetrics(metrics, this.metricData()) : { nodeMetrics: [], edgeMetrics: [] }
    })
    readonly hasMissing = computed(() => hasMissingMetrics(this.missingMetrics()))
    readonly hasAnySelected = computed(() => this.availableSectionKeys().some(key => this.selectedSections()[key]))

    constructor(private readonly scenariosService: ScenariosService) {}

    ngAfterViewInit() {
        const dialog = this.dialogElement().nativeElement
        dialog.addEventListener("close", () => this.closed.emit())
        dialog.showModal()
    }

    toggleSection(key: ScenarioSectionKey, checked: boolean) {
        this.selectedSections.update(current => ({ ...current, [key]: checked }))
    }

    async apply() {
        const selectedKeys = new Set<ScenarioSectionKey>(this.availableSectionKeys().filter(key => this.selectedSections()[key]))
        this.dialogElement().nativeElement.close()
        await this.scenariosService.applyScenario(this.scenario(), selectedKeys, this.metricData())
    }

    close() {
        this.dialogElement().nativeElement.close()
    }
}
