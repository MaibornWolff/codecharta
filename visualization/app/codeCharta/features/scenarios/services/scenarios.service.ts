import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState, MetricData } from "../../../codeCharta.model"
import { setState } from "../../../state/store/state.actions"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { Scenario, ScenarioSections, ScenarioSectionKey } from "../model/scenario.model"
import { buildScenario } from "./scenarioBuilder"
import { buildOrderedStatePatches, getCameraVectors } from "./scenarioApplier"
import { addScenario, deleteScenario as deleteScenarioFromDB, readAllScenarios } from "./scenarioIndexedDB"
import { BUILT_IN_SCENARIOS } from "./builtInScenarios"

@Injectable({ providedIn: "root" })
export class ScenariosService {
    scenarios$ = new BehaviorSubject<Scenario[]>([])

    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly threeRendererService: ThreeRendererService
    ) {}

    async loadScenarios(): Promise<void> {
        const userScenarios = await readAllScenarios()
        userScenarios.sort((a, b) => b.createdAt - a.createdAt)
        this.scenarios$.next([...userScenarios, ...BUILT_IN_SCENARIOS])
    }

    async saveScenario(name: string, description?: string, mapFileNames?: string[]): Promise<Scenario> {
        const cameraPosition = this.threeCameraService.camera?.position
        const cameraTarget = this.threeMapControlsService.controls?.target

        const scenario = buildScenario(
            name,
            this.state.getValue(),
            cameraPosition ? { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z } : { x: 0, y: 300, z: 1000 },
            cameraTarget ? { x: cameraTarget.x, y: cameraTarget.y, z: cameraTarget.z } : { x: 0, y: 0, z: 0 },
            description,
            mapFileNames
        )

        await addScenario(scenario)
        await this.loadScenarios()
        return scenario
    }

    async duplicateScenario(scenario: Scenario): Promise<Scenario> {
        const copy: Scenario = {
            ...scenario,
            id: crypto.randomUUID(),
            name: `${scenario.name} (copy)`,
            createdAt: Date.now(),
            isBuiltIn: undefined,
            mapFileNames: undefined,
            sections: deepCopySections(scenario.sections)
        }

        await addScenario(copy)
        await this.loadScenarios()
        return copy
    }

    async removeScenario(id: string): Promise<void> {
        await deleteScenarioFromDB(id)
        await this.loadScenarios()
    }

    async applyScenario(scenario: Scenario, selectedKeys: Set<ScenarioSectionKey>, metricData?: MetricData): Promise<void> {
        const cameraVectors = selectedKeys.has("camera") ? getCameraVectors(scenario.sections) : undefined
        const applyCamera = cameraVectors !== undefined
        const patches = buildOrderedStatePatches(scenario.sections, selectedKeys, metricData)

        // When applying camera, temporarily disable autoFit so it doesn't
        // overwrite our camera position after the render cycle completes.
        const previousResetCamera = applyCamera ? this.state.getValue().appSettings.resetCameraIfNewFileIsLoaded : undefined
        if (applyCamera && previousResetCamera && patches.length > 0) {
            patches[0].appSettings = { ...patches[0].appSettings, resetCameraIfNewFileIsLoaded: false }
        }

        // Dispatch patches sequentially with microtask gaps so effects
        // triggered by earlier patches (e.g. resetColorRange after metric change)
        // settle before subsequent patches override their values.
        for (const patch of patches) {
            this.store.dispatch(setState({ value: patch }))
            await new Promise<void>(resolve => setTimeout(resolve))
        }

        if (applyCamera) {
            const { position, target } = cameraVectors
            this.threeCameraService.camera.position.set(position.x, position.y, position.z)
            this.threeMapControlsService.setControlTarget(target)
            this.threeCameraService.camera.lookAt(target)
            this.threeCameraService.camera.updateProjectionMatrix()
            this.threeMapControlsService.updateControls()

            // Restore resetCameraIfNewFileIsLoaded after autoFit window has passed.
            if (previousResetCamera) {
                setTimeout(() => {
                    this.store.dispatch(setState({ value: { appSettings: { resetCameraIfNewFileIsLoaded: true } } }))
                })
            }
        }

        this.threeRendererService.render()
    }
}

function deepCopySections(sections: ScenarioSections): ScenarioSections {
    const copy: ScenarioSections = {}

    if (sections.metrics) {
        copy.metrics = { ...sections.metrics }
    }
    if (sections.colors) {
        copy.colors = {
            ...sections.colors,
            colorRange: { ...sections.colors.colorRange },
            ...(sections.colors.mapColors ? { mapColors: { ...sections.colors.mapColors } } : {})
        }
    }
    if (sections.camera) {
        copy.camera = {
            position: { ...sections.camera.position },
            target: { ...sections.camera.target }
        }
    }
    if (sections.filters) {
        copy.filters = {
            blacklist: [...sections.filters.blacklist],
            focusedNodePath: [...sections.filters.focusedNodePath]
        }
    }
    if (sections.labelsAndFolders) {
        copy.labelsAndFolders = {
            ...sections.labelsAndFolders,
            colorLabels: { ...sections.labelsAndFolders.colorLabels },
            markedPackages: [...sections.labelsAndFolders.markedPackages]
        }
    }

    return copy
}
