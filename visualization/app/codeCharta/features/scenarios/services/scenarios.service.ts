import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState, MetricData } from "../../../codeCharta.model"
import { setState } from "../../../state/store/state.actions"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { CCSCENARIO_EXTENSION, fromScenarioFile, Scenario, ScenarioFile, ScenarioSectionKey, toScenarioFile } from "../model/scenario.model"
import { FileDownloader } from "../../../util/fileDownloader"
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

    exportScenario(scenario: Scenario): void {
        const file = toScenarioFile(scenario)
        const sanitizedName = scenario.name.replaceAll(/[^\w-]/g, "_")
        FileDownloader.downloadData(JSON.stringify(file, null, 2), sanitizedName + CCSCENARIO_EXTENSION)
    }

    async importScenarioFiles(files: FileList): Promise<number> {
        const existing = this.scenarios$.getValue()
        let count = 0
        for (const file of files) {
            const text = await file.text()
            const parsed = JSON.parse(text) as ScenarioFile
            if (parsed.schemaVersion !== 1 || !parsed.name || !parsed.sections) {
                continue
            }
            if (this.isDuplicate(parsed, existing)) {
                continue
            }
            const scenario = fromScenarioFile(parsed)
            existing.push(scenario)
            await addScenario(scenario)
            count++
        }
        if (count > 0) {
            await this.loadScenarios()
        }
        return count
    }

    private isDuplicate(file: ScenarioFile, existing: Scenario[]): boolean {
        return existing.some(s => s.name === file.name && JSON.stringify(s.sections) === JSON.stringify(file.sections))
    }
}
