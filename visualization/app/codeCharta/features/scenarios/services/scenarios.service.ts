import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState, MetricData } from "../../../codeCharta.model"
import { setState } from "../../../state/store/state.actions"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { CCSCENARIO_EXTENSION, fromScenarioFile, Scenario, ScenarioFile, ScenarioSectionKey, toScenarioFile } from "../model/scenario.model"

export interface ScenarioImportResult {
    imported: number
    duplicates: string[]
    invalid: string[]
    parseErrors: string[]
}
import { FileDownloader } from "../../../util/fileDownloader"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { buildScenario } from "./scenarioBuilder"
import { buildOrderedStatePatches, getCameraVectors } from "./scenarioApplier"
import { addScenario, deleteScenario as deleteScenarioFromDB, readAllScenarios } from "./scenarioIndexedDB"
import { BUILT_IN_SCENARIOS } from "./builtInScenarios"

@Injectable({ providedIn: "root" })
export class ScenariosService {
    scenarios$ = new BehaviorSubject<Scenario[]>([])
    isApplying = false

    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService,
        private readonly threeRendererService: ThreeRendererService
    ) {}

    async loadScenarios(): Promise<void> {
        try {
            const userScenarios = await readAllScenarios()
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

        const scenario = buildScenario(
            name,
            this.state.getValue(),
            cameraPosition ? { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z } : { x: 0, y: 300, z: 1000 },
            cameraTarget ? { x: cameraTarget.x, y: cameraTarget.y, z: cameraTarget.z } : { x: 0, y: 0, z: 0 },
            description,
            mapFileNames
        )

        try {
            await addScenario(scenario)
            await this.loadScenarios()
        } catch (error) {
            console.error("Failed to save scenario:", error)
        }
        return scenario
    }

    async removeScenario(id: string): Promise<void> {
        try {
            await deleteScenarioFromDB(id)
            await this.loadScenarios()
        } catch (error) {
            console.error("Failed to remove scenario:", error)
        }
    }

    async applyScenario(scenario: Scenario, selectedKeys: Set<ScenarioSectionKey>, metricData?: MetricData): Promise<void> {
        this.isApplying = true
        this.store.dispatch(setIsLoadingFile({ value: true }))

        try {
            // --- Build patches ---
            const cameraVectors = selectedKeys.has("camera") ? getCameraVectors(scenario.sections) : undefined
            const applyCamera = cameraVectors !== undefined
            const patches = buildOrderedStatePatches(scenario.sections, selectedKeys, metricData)

            // When applying camera, temporarily disable autoFit so it doesn't
            // overwrite our camera position after the render cycle completes.
            const previousResetCamera =
                applyCamera && patches.length > 0 ? this.state.getValue().appSettings.resetCameraIfNewFileIsLoaded : undefined
            if (previousResetCamera && patches.length > 0) {
                patches[0].appSettings = { ...patches[0].appSettings, resetCameraIfNewFileIsLoaded: false }
            }

            // --- Dispatch sequentially ---
            // Dispatch patches with macrotask delays so effects triggered by
            // earlier patches (e.g. resetColorRange after metric change)
            // settle before subsequent patches override their values.
            for (const patch of patches) {
                this.store.dispatch(setState({ value: patch }))
                await new Promise<void>(resolve => setTimeout(resolve))
            }

            // --- Apply camera ---
            if (applyCamera && this.threeCameraService.camera) {
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
        } finally {
            this.isApplying = false
            this.store.dispatch(setIsLoadingFile({ value: false }))
            this.store.dispatch(setIsLoadingMap({ value: false }))
        }
    }

    exportScenario(scenario: Scenario): void {
        const file = toScenarioFile(scenario)
        const sanitizedName = scenario.name.replaceAll(/[^\w-]/g, "_")
        FileDownloader.downloadData(JSON.stringify(file, null, 2), sanitizedName + CCSCENARIO_EXTENSION)
    }

    async importScenarioFiles(files: FileList): Promise<ScenarioImportResult> {
        const existing = this.scenarios$.getValue()
        const result: ScenarioImportResult = { imported: 0, duplicates: [], invalid: [], parseErrors: [] }
        for (const file of files) {
            let parsed: ScenarioFile
            try {
                const text = await file.text()
                parsed = JSON.parse(text) as ScenarioFile
            } catch {
                result.parseErrors.push(file.name)
                continue
            }
            if (parsed.schemaVersion !== 1 || !parsed.name || !parsed.sections) {
                result.invalid.push(file.name)
                continue
            }
            if (this.isDuplicate(parsed, existing)) {
                result.duplicates.push(parsed.name)
                continue
            }
            const scenario = fromScenarioFile(parsed)
            existing.push(scenario)
            await addScenario(scenario)
            result.imported++
        }
        if (result.imported > 0) {
            await this.loadScenarios()
        }
        return result
    }

    private isDuplicate(file: ScenarioFile, existing: Scenario[]): boolean {
        return existing.some(s => s.name === file.name && JSON.stringify(s.sections) === JSON.stringify(file.sections))
    }
}
