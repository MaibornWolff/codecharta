import {
    SCENARIO_GROUP_KEYS,
    SCENARIO_SETTING_KEYS,
    SCENARIO_SETTINGS,
    ScenarioGroupKey,
    ScenarioSettingKey,
    ScenarioSettings
} from "./scenarioSettings.registry"

export interface Scenario {
    readonly id: string
    readonly name: string
    readonly description?: string
    readonly mapFileNames?: readonly string[]
    readonly createdAt: number
    readonly isBuiltIn?: boolean
    readonly settings: ScenarioSettings
}

export const CCSCENARIO_EXTENSION = ".ccscenario"

export const SCENARIO_SCHEMA_VERSION = 2

export interface ScenarioFile {
    readonly schemaVersion: typeof SCENARIO_SCHEMA_VERSION
    readonly name: string
    readonly description?: string
    readonly mapFileNames?: readonly string[]
    readonly settings: ScenarioSettings
}

export function getAvailableSettingKeys(scenario: Scenario): ScenarioSettingKey[] {
    return SCENARIO_SETTING_KEYS.filter(key => scenario.settings[key] !== undefined)
}

export function getAvailableGroupKeys(scenario: Scenario): ScenarioGroupKey[] {
    const availableKeys = new Set(getAvailableSettingKeys(scenario))
    return SCENARIO_GROUP_KEYS.filter(group => [...availableKeys].some(key => SCENARIO_SETTINGS[key].group === group))
}

export function toScenarioFile(scenario: Scenario): ScenarioFile {
    return {
        schemaVersion: SCENARIO_SCHEMA_VERSION,
        name: scenario.name,
        ...(scenario.description ? { description: scenario.description } : {}),
        ...(scenario.mapFileNames?.length > 0 ? { mapFileNames: scenario.mapFileNames } : {}),
        settings: scenario.settings
    }
}

export function fromScenarioFile(file: ScenarioFile): Scenario {
    return {
        id: crypto.randomUUID(),
        name: file.name,
        description: file.description,
        mapFileNames: file.mapFileNames,
        createdAt: Date.now(),
        settings: file.settings
    }
}
