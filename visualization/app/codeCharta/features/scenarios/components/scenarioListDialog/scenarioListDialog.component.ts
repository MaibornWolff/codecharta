import { ChangeDetectionStrategy, Component, computed, ElementRef, output, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Store } from "@ngrx/store"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { CcState, MetricData } from "../../../../codeCharta.model"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { getVisibleFiles } from "../../../../model/files/files.helper"
import { CCSCENARIO_EXTENSION, Scenario } from "../../model/scenario.model"
import { ScenariosService } from "../../services/scenarios.service"
import { DeleteConfirmDialogComponent } from "./deleteConfirmDialog/deleteConfirmDialog.component"
import { ImportFeedbackDialogComponent } from "./importFeedbackDialog/importFeedbackDialog.component"
import { ScenarioItemComponent } from "./scenarioItem/scenarioItem.component"
import { ScenarioViewModelService } from "../../services/scenarioViewModel.service"

@Component({
    selector: "cc-scenario-list-dialog",
    templateUrl: "./scenarioListDialog.component.html",
    imports: [FormsModule, DeleteConfirmDialogComponent, ImportFeedbackDialogComponent, ScenarioItemComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioListDialogComponent {
    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")
    readonly deleteConfirmDialogRef = viewChild.required(DeleteConfirmDialogComponent)
    readonly importFeedbackDialogRef = viewChild.required(ImportFeedbackDialogComponent)
    readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>("fileInput")
    readonly applyRequested = output<{ scenario: Scenario; metricData: MetricData }>()
    readonly deleteTarget = signal<Scenario | null>(null)
    readonly acceptExtensions = `${CCSCENARIO_EXTENSION},.json`

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
        const visible = this.visibleFileNames()
        const filtered = term
            ? all.filter(s => s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term))
            : [...all]
        return filtered.sort((a, b) => this.helpers.getScenarioPriority(a, visible) - this.helpers.getScenarioPriority(b, visible))
    })

    readonly groupedScenarios = computed(() => {
        const visible = this.visibleFileNames()
        const metricData = this.metricData()
        const groups = this.helpers.groupScenarios(this.filteredScenarios(), visible)
        return groups.map(group => ({
            ...group,
            scenarios: group.scenarios.map(scenario => this.helpers.toScenarioView(scenario, visible, metricData))
        }))
    })

    constructor(
        private readonly scenariosService: ScenariosService,
        private readonly store: Store<CcState>,
        private readonly helpers: ScenarioViewModelService
    ) {}

    async open() {
        await this.scenariosService.loadScenarios()
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    applyScenario(scenario: Scenario) {
        this.close()
        this.applyRequested.emit({ scenario, metricData: this.metricData() })
    }

    exportScenario(scenario: Scenario) {
        this.scenariosService.exportScenario(scenario)
    }

    openImportDialog() {
        this.fileInput().nativeElement.click()
    }

    async handleImportFiles(event: Event) {
        const input = event.target as HTMLInputElement
        if (!input.files || input.files.length === 0) {
            return
        }
        const result = await this.scenariosService.importScenarioFiles(input.files)
        input.value = ""
        this.importFeedbackDialogRef().open(result)
    }

    requestDelete(scenario: Scenario) {
        this.deleteTarget.set(scenario)
        this.deleteConfirmDialogRef().open()
    }

    cancelDelete() {
        this.deleteTarget.set(null)
    }

    async confirmDelete() {
        const scenario = this.deleteTarget()
        if (scenario) {
            this.deleteTarget.set(null)
            await this.scenariosService.removeScenario(scenario.id)
        }
    }
}
