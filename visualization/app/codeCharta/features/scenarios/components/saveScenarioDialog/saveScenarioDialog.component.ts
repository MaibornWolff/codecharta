import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { map } from "rxjs"
import { getVisibleFiles } from "../../../../model/files/files.helper"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { SCENARIO_SETTING_KEYS, SCENARIO_SETTINGS, ScenarioSettingKey } from "../../model/scenarioSettings.registry"
import { ScenariosService } from "../../services/scenarios.service"
import { ScenarioSettingsPickerComponent } from "../scenarioSettingsPicker/scenarioSettingsPicker.component"
import { settingCountLabel } from "../scenarioSettingsPicker/settingCountLabel"

/** The camera is the one group that is map-specific, so a scenario only carries it on request. */
const DEFAULT_SELECTED_KEYS: readonly ScenarioSettingKey[] = SCENARIO_SETTING_KEYS.filter(key => SCENARIO_SETTINGS[key].group !== "camera")

@Component({
    selector: "cc-save-scenario-dialog",
    templateUrl: "./saveScenarioDialog.component.html",
    imports: [FormsModule, ScenarioSettingsPickerComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveScenarioDialogComponent {
    readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")

    readonly name = signal("")
    readonly description = signal("")
    readonly bindToMap = signal(false)
    readonly nameValid = computed(() => this.name().trim().length > 0)

    readonly availableKeys = SCENARIO_SETTING_KEYS
    readonly defaultKeys = DEFAULT_SELECTED_KEYS
    readonly selectedKeys = signal<ReadonlySet<ScenarioSettingKey>>(new Set(DEFAULT_SELECTED_KEYS))
    readonly selectionSummary = computed(() => `${this.selectedKeys().size} of ${this.availableKeys.length} settings`)
    readonly saveLabel = computed(() => `Save ${settingCountLabel(this.selectedKeys().size)}`)

    readonly visibleFileNames = toSignal(
        this.fileStoreReadWindow.files$.pipe(map(fileStates => getVisibleFiles(fileStates).map(f => f.fileMeta.fileName))),
        { initialValue: [] as string[] }
    )

    readonly hasFiles = computed(() => this.visibleFileNames().length > 0)

    constructor(
        private readonly scenariosService: ScenariosService,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    open() {
        this.name.set("")
        this.description.set("")
        this.bindToMap.set(false)
        this.selectedKeys.set(new Set(DEFAULT_SELECTED_KEYS))
        this.dialogElement().nativeElement.showModal()
    }

    close() {
        this.dialogElement().nativeElement.close()
    }

    async save() {
        if (!this.nameValid() || this.selectedKeys().size === 0) {
            return
        }
        const mapFileNames = this.bindToMap() && this.hasFiles() ? this.visibleFileNames() : undefined
        await this.scenariosService.saveScenario({
            name: this.name(),
            description: this.description() || undefined,
            mapFileNames,
            selectedKeys: this.selectedKeys()
        })
        this.close()
    }
}
