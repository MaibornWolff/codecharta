import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { ThreeCameraService } from "../../../ui/codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { CCSCENARIO_EXTENSION, fromScenarioFile, Scenario, ScenarioFile, toScenarioFile } from "../model/scenario.model"

export interface ScenarioImportResult {
    imported: number
    duplicates: string[]
    invalid: string[]
    parseErrors: string[]
}
import { FileDownloader } from "../../../util/fileDownloader"
import { buildScenario } from "./scenarioBuilder"
import { addScenario, deleteScenario as deleteScenarioFromDB, readAllScenarios } from "./scenarioIndexedDB"
import { BUILT_IN_SCENARIOS } from "./builtInScenarios"

@Injectable({ providedIn: "root" })
export class ScenariosService {
    scenarios$ = new BehaviorSubject<Scenario[]>([])

    constructor(
        private readonly state: State<CcState>,
        private readonly threeCameraService: ThreeCameraService,
        private readonly threeMapControlsService: ThreeMapControlsService
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
