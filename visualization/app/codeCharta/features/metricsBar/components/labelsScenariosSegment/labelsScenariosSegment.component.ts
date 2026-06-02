import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MetricData } from "../../../../codeCharta.model"
import { LabelSettingsPanelComponent } from "../../../labelSettings/components/labelSettingsPanel/labelSettingsPanel.component"
import { ApplyScenarioDialogComponent } from "../../../scenarios/components/applyScenarioDialog/applyScenarioDialog.component"
import { SaveScenarioDialogComponent } from "../../../scenarios/components/saveScenarioDialog/saveScenarioDialog.component"
import { ScenarioListDialogComponent } from "../../../scenarios/components/scenarioListDialog/scenarioListDialog.component"
import { Scenario } from "../../../scenarios/model/scenario.model"
import { ScenariosService } from "../../../scenarios/services/scenarios.service"

@Component({
    selector: "cc-labels-scenarios-segment",
    templateUrl: "./labelsScenariosSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "group flex flex-col items-stretch px-3 py-2 transition-colors relative" },
    imports: [LabelSettingsPanelComponent, ScenarioListDialogComponent, SaveScenarioDialogComponent, ApplyScenarioDialogComponent]
})
export class LabelsScenariosSegmentComponent implements OnInit {
    private readonly scenariosService = inject(ScenariosService)

    readonly listDialog = viewChild.required<ScenarioListDialogComponent>("listDialog")
    readonly saveDialog = viewChild.required<SaveScenarioDialogComponent>("saveDialog")

    readonly applyTarget = signal<{ scenario: Scenario; metricData: MetricData } | null>(null)

    readonly scenarios = toSignal(this.scenariosService.scenarios$, { initialValue: [] as Scenario[] })

    readonly scenariosCountLabel = computed(() => {
        const count = this.scenarios().length
        return `${count} ${count === 1 ? "scenario" : "scenarios"} available`
    })

    ngOnInit(): void {
        void this.scenariosService.loadScenarios()
    }

    openScenarioList() {
        this.listDialog().open()
    }

    openSaveDialog() {
        this.saveDialog().open()
    }

    handleApplyRequested(event: { scenario: Scenario; metricData: MetricData }) {
        this.applyTarget.set(event)
    }

    handleApplyClosed() {
        this.applyTarget.set(null)
    }
}
