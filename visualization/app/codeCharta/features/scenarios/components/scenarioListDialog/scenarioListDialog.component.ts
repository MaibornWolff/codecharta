import { Component, computed, ElementRef, output, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Store } from "@ngrx/store"
import { toSignal } from "@angular/core/rxjs-interop"
import { CcState, MetricData } from "../../../../codeCharta.model"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { Scenario, SCENARIO_SECTION_ICONS, SCENARIO_SECTION_LABELS, ScenarioSectionKey } from "../../model/scenario.model"
import { ScenariosService } from "../../services/scenarios.service"
import { getMissingMetrics, hasMissingMetrics } from "../../services/getMissingMetrics"

@Component({
    selector: "cc-scenario-list-dialog",
    templateUrl: "./scenarioListDialog.component.html",
    imports: [FormsModule]
})
export class ScenarioListDialogComponent {
    readonly sectionKeys: ScenarioSectionKey[] = ["metrics", "colors", "camera", "filters", "labelsAndFolders"]
    readonly sectionLabels = SCENARIO_SECTION_LABELS
    readonly sectionIcons = SCENARIO_SECTION_ICONS

    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")
    readonly applyRequested = output<{ scenario: Scenario; metricData: MetricData }>()

    readonly scenarios = toSignal(this.scenariosService.scenarios$, { initialValue: [] as Scenario[] })
    readonly metricData = toSignal(this.store.select(metricDataSelector), { requireSync: true })
    readonly searchTerm = signal("")
    readonly filteredScenarios = computed(() => {
        const term = this.searchTerm().toLowerCase()
        const all = this.scenarios()
        return term
            ? all.filter(s => s.name.toLowerCase().includes(term) || (s.description && s.description.toLowerCase().includes(term)))
            : [...all]
    })

    constructor(
        private readonly scenariosService: ScenariosService,
        private readonly store: Store<CcState>
    ) {}

    open() {
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    hasWarning(scenario: Scenario): boolean {
        const missing = getMissingMetrics(scenario.sections.metrics, this.metricData())
        return hasMissingMetrics(missing)
    }

    applyScenario(scenario: Scenario) {
        this.close()
        this.applyRequested.emit({ scenario, metricData: this.metricData() })
    }

    async deleteScenario(scenario: Scenario) {
        if (window.confirm(`Delete scenario "${scenario.name}"?`)) {
            await this.scenariosService.removeScenario(scenario.id)
        }
    }

    formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleDateString()
    }
}
