import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    linkedSignal,
    output,
    viewChild
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MetricData } from "../../../../model/codeCharta.model"
import { getAvailableSettingKeys, Scenario } from "../../model/scenario.model"
import { METRIC_SELECTION_SETTING_KEYS, ScenarioSettingKey } from "../../model/scenarioSettings.registry"
import { ScenarioApplierService } from "../../services/scenarioApplier.service"
import { ScenarioSettingsPickerComponent } from "../scenarioSettingsPicker/scenarioSettingsPicker.component"

@Component({
    selector: "cc-apply-scenario-dialog",
    templateUrl: "./applyScenarioDialog.component.html",
    imports: [FormsModule, ScenarioSettingsPickerComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyScenarioDialogComponent implements AfterViewInit {
    readonly scenario = input.required<Scenario>()
    readonly metricData = input.required<MetricData>()
    readonly closed = output<void>()

    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    readonly availableKeys = computed(() => getAvailableSettingKeys(this.scenario()))

    readonly selectedKeys = linkedSignal<ReadonlySet<ScenarioSettingKey>>(() => new Set(this.availableKeys()))

    readonly missingMetrics = computed(() => this.scenarioApplier.getMissingMetrics(this.scenario().settings, this.metricData()))
    readonly hasMissing = computed(() => this.scenarioApplier.hasMissingMetrics(this.missingMetrics()))
    readonly isMetricSelected = computed(() => METRIC_SELECTION_SETTING_KEYS.some(key => this.selectedKeys().has(key)))
    readonly hasAnySelected = computed(() => this.selectedKeys().size > 0)

    private readonly destroyRef = inject(DestroyRef)

    constructor(private readonly scenarioApplier: ScenarioApplierService) {}

    ngAfterViewInit() {
        const dialog = this.dialogElement().nativeElement
        const handler = () => this.closed.emit()
        dialog.addEventListener("close", handler)
        this.destroyRef.onDestroy(() => dialog.removeEventListener("close", handler))
        dialog.showModal()
    }

    async apply() {
        const selectedKeys = this.selectedKeys()
        this.dialogElement().nativeElement.close()
        await this.scenarioApplier.applyScenario(this.scenario(), selectedKeys, this.metricData())
    }

    close() {
        this.dialogElement().nativeElement.close()
    }
}
