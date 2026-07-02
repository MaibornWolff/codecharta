import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { CcState, ColorMode } from "../../../codeCharta.model"
import { ThreeCameraService, ThreeMapControlsService } from "../../../features/codeMap/facade"
import { PlainPosition, Scenario, ScenarioSections } from "../model/scenario.model"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { ScenariosStore } from "../stores/scenarios.store"

const DEFAULT_MAP_COLORS = {
    positive: "#69AE40",
    neutral: "#ddcc00",
    negative: "#820E0E"
}

const BUILT_IN_SCENARIOS: Scenario[] = [
    {
        id: "built-in-rloc",
        name: "Real Lines of Code",
        description: "Visualize code size using real lines of code",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc", isColorMetricLinkedToHeightMetric: true },
            colors: { colorRange: { from: 250, to: 500 }, colorMode: ColorMode.weightedGradient, mapColors: DEFAULT_MAP_COLORS }
        }
    },
    {
        id: "built-in-complexity",
        name: "Complexity",
        description: "Visualize cyclomatic complexity",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: {
                areaMetric: "rloc",
                heightMetric: "complexity",
                colorMetric: "complexity",
                isColorMetricLinkedToHeightMetric: true
            },
            colors: { colorRange: { from: 50, to: 100 }, colorMode: ColorMode.weightedGradient, mapColors: DEFAULT_MAP_COLORS }
        }
    },
    {
        id: "built-in-comment-lines",
        name: "Comment Lines",
        description: "Visualize comment density",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: {
                areaMetric: "rloc",
                heightMetric: "comment_lines",
                colorMetric: "comment_lines",
                isColorMetricLinkedToHeightMetric: true
            },
            colors: { colorRange: { from: 50, to: 100 }, colorMode: ColorMode.weightedGradient, mapColors: DEFAULT_MAP_COLORS }
        }
    },
    {
        id: "built-in-code-smells",
        name: "Code Smells",
        description: "Visualize code smell density",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: {
                areaMetric: "rloc",
                heightMetric: "code_smell",
                colorMetric: "code_smell",
                isColorMetricLinkedToHeightMetric: true
            },
            colors: { colorRange: { from: 10, to: 50 }, colorMode: ColorMode.weightedGradient, mapColors: DEFAULT_MAP_COLORS }
        }
    },
    {
        id: "built-in-logic-complexity",
        name: "Logic Complexity",
        description: "Visualize cognitive/logic complexity",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: {
                areaMetric: "rloc",
                heightMetric: "logic_complexity",
                colorMetric: "logic_complexity",
                isColorMetricLinkedToHeightMetric: true
            },
            colors: { colorRange: { from: 40, to: 80 }, colorMode: ColorMode.weightedGradient, mapColors: DEFAULT_MAP_COLORS }
        }
    },
    {
        id: "built-in-max-complexity-per-function",
        name: "Max Complexity per Function",
        description: "Visualize maximum complexity per function",
        createdAt: 0,
        isBuiltIn: true,
        sections: {
            metrics: {
                areaMetric: "rloc",
                heightMetric: "max_complexity_per_function",
                colorMetric: "max_complexity_per_function",
                isColorMetricLinkedToHeightMetric: true
            },
            colors: { colorRange: { from: 10, to: 20 }, colorMode: ColorMode.weightedGradient, mapColors: DEFAULT_MAP_COLORS }
        }
    }
]

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

    async saveScenario(name: string, description?: string, mapFileNames?: string[]): Promise<Scenario> {
        const cameraPosition = this.threeCameraService.camera?.position
        const cameraTarget = this.threeMapControlsService.controls?.target

        const scenario = this.buildScenario(
            name,
            this.scenariosStore.getValue(),
            cameraPosition ? { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z } : { x: 0, y: 300, z: 1000 },
            cameraTarget ? { x: cameraTarget.x, y: cameraTarget.y, z: cameraTarget.z } : { x: 0, y: 0, z: 0 },
            description,
            mapFileNames
        )

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

    buildScenarioSections(state: CcState, cameraPosition: PlainPosition, cameraTarget: PlainPosition): ScenarioSections {
        return {
            metrics: {
                areaMetric: state.mapState.areaMetric,
                heightMetric: state.mapState.heightMetric,
                colorMetric: state.mapState.colorMetric,
                edgeMetric: state.mapState.edgeMetric,
                distributionMetric: state.mapState.distributionMetric,
                isColorMetricLinkedToHeightMetric: state.appSettings.isColorMetricLinkedToHeightMetric
            },
            colors: {
                colorRange: { ...state.mapState.colorRange },
                colorMode: state.mapState.colorMode,
                mapColors: { ...state.mapState.mapColors }
            },
            camera: {
                position: { ...cameraPosition },
                target: { ...cameraTarget }
            },
            filters: {
                blacklist: [...state.sharedView.blacklist],
                focusedNodePath: [...state.sharedView.focusedNodePath]
            },
            labelsAndFolders: {
                amountOfTopLabels: state.mapState.amountOfTopLabels,
                labelSize: state.mapState.labelSize,
                showMetricLabelNameValue: state.mapState.showMetricLabelNameValue,
                showMetricLabelNodeName: state.mapState.showMetricLabelNodeName,
                enableFloorLabels: state.mapState.enableFloorLabels,
                colorLabels: { ...state.mapState.colorLabels },
                labelMode: state.mapState.labelMode,
                groupLabelCollisions: state.mapState.groupLabelCollisions,
                markedPackages: [...state.sharedView.markedPackages]
            }
        }
    }

    buildScenario(
        name: string,
        state: CcState,
        cameraPosition: PlainPosition,
        cameraTarget: PlainPosition,
        description?: string,
        mapFileNames?: string[]
    ): Scenario {
        return {
            id: crypto.randomUUID(),
            name,
            description,
            mapFileNames,
            createdAt: Date.now(),
            sections: this.buildScenarioSections(state, cameraPosition, cameraTarget)
        }
    }
}
