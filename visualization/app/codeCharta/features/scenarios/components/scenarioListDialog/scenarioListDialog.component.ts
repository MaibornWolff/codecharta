import { Component, computed, ElementRef, output, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Store } from "@ngrx/store"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { CcState, MetricData } from "../../../../codeCharta.model"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { getVisibleFiles } from "../../../../model/files/files.helper"
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
    readonly deleteConfirmDialog = viewChild.required<ElementRef<HTMLDialogElement>>("deleteConfirmDialog")
    readonly applyRequested = output<{ scenario: Scenario; metricData: MetricData }>()
    readonly deleteTarget = signal<Scenario | null>(null)

    readonly scenarios = toSignal(this.scenariosService.scenarios$, { initialValue: [] as Scenario[] })
    readonly metricData = toSignal(this.store.select(metricDataSelector), { requireSync: true })
    readonly searchTerm = signal("")

    readonly visibleFileNames = toSignal(
        this.store.select(filesSelector).pipe(map(fileStates => new Set(getVisibleFiles(fileStates).map(f => f.fileMeta.fileName)))),
        { initialValue: new Set<string>() }
    )

    readonly filteredScenarios = computed(() => {
        const term = this.searchTerm().toLowerCase()
        const all = this.scenarios()
        return term ? all.filter(s => s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term)) : [...all]
    })

    constructor(
        private readonly scenariosService: ScenariosService,
        private readonly store: Store<CcState>
    ) {}

    async open() {
        await this.scenariosService.loadScenarios()
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    hasWarning(scenario: Scenario): boolean {
        const missing = getMissingMetrics(scenario.sections.metrics, this.metricData())
        return hasMissingMetrics(missing)
    }

    isMapBound(scenario: Scenario): boolean {
        return (scenario.mapFileNames?.length ?? 0) > 0
    }

    isMapMismatch(scenario: Scenario): boolean {
        if ((scenario.mapFileNames?.length ?? 0) === 0) {
            return false
        }
        const visible = this.visibleFileNames()
        return !scenario.mapFileNames.some(name => visible.has(name))
    }

    applyScenario(scenario: Scenario) {
        this.close()
        this.applyRequested.emit({ scenario, metricData: this.metricData() })
    }

    async duplicateScenario(scenario: Scenario) {
        await this.scenariosService.duplicateScenario(scenario)
    }

    requestDelete(scenario: Scenario) {
        this.deleteTarget.set(scenario)
        this.deleteConfirmDialog().nativeElement.showModal()
    }

    cancelDelete() {
        this.deleteConfirmDialog().nativeElement.close()
        this.deleteTarget.set(null)
    }

    async confirmDelete() {
        const scenario = this.deleteTarget()
        if (scenario) {
            this.deleteConfirmDialog().nativeElement.close()
            this.deleteTarget.set(null)
            await this.scenariosService.removeScenario(scenario.id)
        }
    }

    formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleDateString()
    }
}
