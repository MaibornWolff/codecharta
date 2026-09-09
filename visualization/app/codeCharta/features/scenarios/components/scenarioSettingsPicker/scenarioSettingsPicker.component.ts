import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core"
import {
    SCENARIO_GROUP_ICONS,
    SCENARIO_GROUP_KEYS,
    SCENARIO_GROUP_LABELS,
    SCENARIO_SETTINGS,
    ScenarioGroupKey,
    ScenarioSettingKey
} from "../../model/scenarioSettings.registry"

interface PickerSetting {
    readonly key: ScenarioSettingKey
    readonly label: string
    readonly selected: boolean
}

export interface PickerGroup {
    readonly key: ScenarioGroupKey
    readonly label: string
    readonly icon: string
    readonly settings: PickerSetting[]
    readonly allSelected: boolean
    readonly someSelected: boolean
}

@Component({
    selector: "cc-scenario-settings-picker",
    templateUrl: "./scenarioSettingsPicker.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioSettingsPickerComponent {
    readonly availableKeys = input.required<readonly ScenarioSettingKey[]>()
    /** What "Reset" goes back to — the selection the dialog opens with. */
    readonly defaultKeys = input.required<readonly ScenarioSettingKey[]>()
    readonly selectedKeys = model.required<ReadonlySet<ScenarioSettingKey>>()

    readonly isDefaultSelection = computed(() => {
        const selected = this.selectedKeys()
        const defaults = this.defaultKeys()
        return selected.size === defaults.length && defaults.every(key => selected.has(key))
    })

    readonly groups = computed<PickerGroup[]>(() => {
        const selected = this.selectedKeys()
        const available = this.availableKeys()
        return SCENARIO_GROUP_KEYS.map(groupKey => this.toPickerGroup(groupKey, available, selected)).filter(
            group => group.settings.length > 0
        )
    })

    selectAll() {
        this.selectedKeys.set(new Set(this.availableKeys()))
    }

    selectNone() {
        this.selectedKeys.set(new Set())
    }

    resetSelection() {
        this.selectedKeys.set(new Set(this.defaultKeys()))
    }

    toggleSetting(key: ScenarioSettingKey, isSelected: boolean) {
        this.selectedKeys.update(current => withSelection(current, [key], isSelected))
    }

    toggleGroup(group: PickerGroup, isSelected: boolean) {
        this.selectedKeys.update(current =>
            withSelection(
                current,
                group.settings.map(setting => setting.key),
                isSelected
            )
        )
    }

    private toPickerGroup(
        groupKey: ScenarioGroupKey,
        available: readonly ScenarioSettingKey[],
        selected: ReadonlySet<ScenarioSettingKey>
    ): PickerGroup {
        const settings = available
            .filter(key => SCENARIO_SETTINGS[key].group === groupKey)
            .map(key => ({ key, label: SCENARIO_SETTINGS[key].label, selected: selected.has(key) }))

        return {
            key: groupKey,
            label: SCENARIO_GROUP_LABELS[groupKey],
            icon: SCENARIO_GROUP_ICONS[groupKey],
            settings,
            allSelected: settings.length > 0 && settings.every(setting => setting.selected),
            someSelected: settings.some(setting => setting.selected)
        }
    }
}

function withSelection(
    current: ReadonlySet<ScenarioSettingKey>,
    keys: ScenarioSettingKey[],
    isSelected: boolean
): ReadonlySet<ScenarioSettingKey> {
    const next = new Set(current)
    for (const key of keys) {
        if (isSelected) {
            next.add(key)
        } else {
            next.delete(key)
        }
    }
    return next
}
