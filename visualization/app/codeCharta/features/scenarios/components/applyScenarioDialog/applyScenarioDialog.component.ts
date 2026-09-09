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
import { pickScenarioSettings, SCENARIO_SETTINGS, ScenarioSettingKey } from "../../model/scenarioSettings.registry"
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

    /** The camera starts unchecked, so opening a scenario never moves the view unless it is asked for. */
    readonly defaultKeys = computed(() => this.availableKeys().filter(key => SCENARIO_SETTINGS[key].group !== "camera"))

    readonly selectedKeys = linkedSignal<ReadonlySet<ScenarioSettingKey>>(() => new Set(this.defaultKeys()))

    /** Only the metrics that are actually about to be applied can be missing from the current map. */
    readonly missingMetrics = computed(() =>
        this.scenarioApplier.getMissingMetrics(pickScenarioSettings(this.scenario().settings, this.selectedKeys()), this.metricData())
    )
    readonly hasMissing = computed(() => this.scenarioApplier.hasMissingMetrics(this.missingMetrics()))
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
