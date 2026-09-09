import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { ColorMode, ColorRange } from "../../../model/codeCharta.model"
import { ThreeCameraService, ThreeMapControlsService } from "../../../renderer/threeViewer/threeViewer.facade"
import { Scenario } from "../model/scenario.model"
import {
    readScenarioSettings,
    ScenarioBandColors,
    ScenarioCamera,
    ScenarioSettingKey,
    ScenarioSettingsSource
} from "../model/scenarioSettings.registry"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { ScenariosStore } from "../stores/scenarios.store"

export interface ScenarioDraft {
    readonly name: string
    readonly description?: string
    readonly mapFileNames?: readonly string[]
    readonly selectedKeys: ReadonlySet<ScenarioSettingKey>
}

const DEFAULT_CAMERA: ScenarioCamera = { position: { x: 0, y: 300, z: 1000 }, target: { x: 0, y: 0, z: 0 } }

const DEFAULT_MAP_COLORS: ScenarioBandColors = {
    positive: "#69AE40",
    neutral: "#ddcc00",
    negative: "#820E0E"
}

const INVERTED_MAP_COLORS: ScenarioBandColors = {
    positive: DEFAULT_MAP_COLORS.negative,
    neutral: DEFAULT_MAP_COLORS.neutral,
    negative: DEFAULT_MAP_COLORS.positive,
    isColorRangeInverted: true
}

interface BuiltInScenarioDefinition {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly metric: string
    readonly colorRange: ColorRange
    readonly colorMode?: ColorMode
    readonly mapColors?: ScenarioBandColors
}

const BUILT_IN_DEFINITIONS: BuiltInScenarioDefinition[] = [
    {
        id: "built-in-rloc",
        name: "Real Lines of Code",
        description: "Visualize code size using real lines of code",
        metric: "rloc",
        colorRange: { from: 250, to: 500 }
    },
    {
        id: "built-in-complexity",
        name: "Complexity",
        description: "Visualize cyclomatic complexity",
        metric: "complexity",
        colorRange: { from: 50, to: 100 }
    },
    {
        id: "built-in-comment-lines",
        name: "Comment Lines",
        description: "Visualize comment density",
        metric: "comment_lines",
        colorRange: { from: 50, to: 100 }
    },
    {
        id: "built-in-code-smells",
        name: "Code Smells",
        description: "Visualize code smell density",
        metric: "sonar_code_smells",
        colorRange: { from: 10, to: 50 }
    },
    {
        id: "built-in-logic-complexity",
        name: "Logic Complexity",
        description: "Visualize cognitive/logic complexity",
        metric: "logic_complexity",
        colorRange: { from: 40, to: 80 }
    },
    {
        id: "built-in-max-complexity-per-function",
        name: "Max Complexity per Function",
        description: "Visualize maximum complexity per function",
        metric: "max_complexity_per_function",
        colorRange: { from: 10, to: 20 }
    },
    {
        id: "built-in-authors",
        name: "Authors",
        description: "Visualize the number of authors per file",
        metric: "number_of_authors",
        colorRange: { from: 2, to: 3 },
        colorMode: ColorMode.absolute,
        mapColors: INVERTED_MAP_COLORS
    }
]

const BUILT_IN_SCENARIOS: Scenario[] = BUILT_IN_DEFINITIONS.map(definition => ({
    id: definition.id,
    name: definition.name,
    description: definition.description,
    createdAt: 0,
    isBuiltIn: true,
    settings: {
        areaMetric: "rloc",
        heightMetric: definition.metric,
        colorMetric: definition.metric,
        isColorMetricLinkedToHeightMetric: true,
        colorRange: definition.colorRange,
        colorMode: definition.colorMode ?? ColorMode.weightedGradient,
        mapColors: definition.mapColors ?? DEFAULT_MAP_COLORS
    }
}))

@Injectable({ providedIn: "root" })
export class ScenariosService {
    scenarios$ = new BehaviorSubject<Scenario[]>([])

    constructor(
        private readonly scenariosStore: ScenariosStore,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly db: ScenarioIndexedDBService
    ) {}

    async loadScenarios(): Promise<void> {
        try {
            const userScenarios = await this.db.readAll()
            userScenarios.sort((a, b) => b.createdAt - a.createdAt)
            this.scenarios$.next([...userScenarios, ...BUILT_IN_SCENARIOS])
        } catch (error) {
            console.error("Failed to load scenarios from IndexedDB:", error)
            this.scenarios$.next([...BUILT_IN_SCENARIOS])
        }
    }

    async saveScenario(draft: ScenarioDraft): Promise<Scenario> {
        const scenario = this.buildScenario(draft, this.readCurrentSource())

        try {
            await this.db.add(scenario)
            await this.loadScenarios()
        } catch (error) {
            console.error("Failed to save scenario:", error)
        }
        return scenario
    }

    async removeScenario(id: string): Promise<void> {
        try {
            await this.db.delete(id)
            await this.loadScenarios()
        } catch (error) {
            console.error("Failed to remove scenario:", error)
        }
    }

    buildScenario(draft: ScenarioDraft, source: ScenarioSettingsSource): Scenario {
        return {
            id: crypto.randomUUID(),
            name: draft.name,
            description: draft.description,
            mapFileNames: draft.mapFileNames,
            createdAt: Date.now(),
            settings: readScenarioSettings(source, draft.selectedKeys)
        }
    }

    private readCurrentSource(): ScenarioSettingsSource {
        return { state: this.scenariosStore.getValue(), camera: this.readCurrentCamera() }
    }

    private readCurrentCamera(): ScenarioCamera {
        const position = this.threeCameraService.camera?.position
        const target = this.threeMapControlsService.controls?.target
        return {
            position: position ? { x: position.x, y: position.y, z: position.z } : DEFAULT_CAMERA.position,
            target: target ? { x: target.x, y: target.y, z: target.z } : DEFAULT_CAMERA.target
        }
    }
}
