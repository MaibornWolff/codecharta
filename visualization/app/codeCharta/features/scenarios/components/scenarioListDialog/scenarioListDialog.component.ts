import { ChangeDetectionStrategy, Component, computed, ElementRef, output, signal, viewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Store } from "@ngrx/store"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { CcState, MetricData } from "../../../../codeCharta.model"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { filesSelector } from "../../../../state/store/files/files.selector"
import { getVisibleFiles } from "../../../../model/files/files.helper"
import { CCSCENARIO_EXTENSION, getAvailableSectionKeys, Scenario } from "../../model/scenario.model"
import { ScenariosService } from "../../services/scenarios.service"
import { getMissingMetrics, hasMissingMetrics } from "../../services/getMissingMetrics"
import { DeleteConfirmDialogComponent } from "./deleteConfirmDialog/deleteConfirmDialog.component"
import { ImportFeedbackDialogComponent } from "./importFeedbackDialog/importFeedbackDialog.component"
import { ScenarioItemComponent } from "./scenarioItem/scenarioItem.component"
import { ScenarioView } from "./scenarioView.model"

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
        return filtered.sort((a, b) => getScenarioPriority(a, visible) - getScenarioPriority(b, visible))
    })

    readonly groupedScenarios = computed(() => {
        const visible = this.visibleFileNames()
        const metricData = this.metricData()
        const groups = groupScenarios(this.filteredScenarios(), visible)
        return groups.map(group => ({
            ...group,
            scenarios: group.scenarios.map(scenario => toScenarioView(scenario, visible, metricData))
        }))
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

const GROUP_DEFINITIONS: { priority: number; label: string; icon: string }[] = [
    { priority: 0, label: "Current Map", icon: "fa-map-pin" },
    { priority: 1, label: "Global", icon: "fa-globe" },
    { priority: 2, label: "Built-in", icon: "fa-cube" },
    { priority: 3, label: "Other Maps", icon: "fa-map-o" }
]

interface RawScenarioGroup {
    label: string
    icon: string
    scenarios: Scenario[]
}

export function groupScenarios(scenarios: Scenario[], visibleFileNames: Set<string>): RawScenarioGroup[] {
    const buckets = new Map<number, Scenario[]>()
    for (const scenario of scenarios) {
        const priority = getScenarioPriority(scenario, visibleFileNames)
        const bucket = buckets.get(priority)
        if (bucket) {
            bucket.push(scenario)
        } else {
            buckets.set(priority, [scenario])
        }
    }
    return GROUP_DEFINITIONS.filter(def => buckets.has(def.priority)).map(def => ({
        label: def.label,
        icon: def.icon,
        scenarios: buckets.get(def.priority) ?? []
    }))
}

export function toScenarioView(scenario: Scenario, visibleFileNames: Set<string>, metricData: MetricData): ScenarioView {
    const mapBound = (scenario.mapFileNames?.length ?? 0) > 0
    const mapMismatch = mapBound && !scenario.mapFileNames.some(name => visibleFileNames.has(name))
    const warning = scenario.sections.metrics ? hasMissingMetrics(getMissingMetrics(scenario.sections.metrics, metricData)) : false
    return {
        scenario,
        warning,
        mapMismatch,
        mapBound,
        sectionKeys: getAvailableSectionKeys(scenario),
        formattedDate: new Date(scenario.createdAt).toLocaleDateString()
    }
}

export function getScenarioPriority(scenario: Scenario, visibleFileNames: Set<string>): number {
    const isBound = (scenario.mapFileNames?.length ?? 0) > 0
    if (isBound && scenario.mapFileNames?.some(name => visibleFileNames.has(name))) {
        return 0
    }
    if (!isBound && !scenario.isBuiltIn) {
        return 1
    }
    if (scenario.isBuiltIn) {
        return 2
    }
    return 3
}
