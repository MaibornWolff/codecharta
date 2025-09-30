import { Injectable } from "@angular/core"
import { LayoutAlgorithm } from "../../../../codeCharta.model"
import { ColorMode } from "../algo-ui.component"
import { OrderOption, SortingOption } from "../../squarifyLayoutImproved/squarify"

export interface AlgoUiState {
    margin: number
    showFloorLabels: boolean
    amountOfFloorLabels: number
    floorLabelLength: number
    renderLabelNames: boolean
    selectedAlgorithm: LayoutAlgorithm
    selectedAreaMetric: string
    searchTerm: string
    filter: string
    showEvaluationMetrics: boolean
    colorMode: ColorMode
    selectedColorMetric: string
    invertColors: boolean
    isNodeNumberingActive: boolean
    numberOfPasses: number
    useScale: boolean
    useSimpleIncreaseValues: boolean
    selectedOrderOption: OrderOption
    incrementMargin: boolean
    applySiblingMargin: boolean
    collapseFolders: boolean
    selectedSorting: SortingOption
    minNodeSize: number
    maxNodeSize: number
    minFloorLabelSize: number
    maxFloorLabelSize: number
    is3DView: boolean
    showEdges: boolean
    maxSunburstRadius: number
    folderHeightMultiplier: number
    leafHeightMultiplier: number
    folderLengthMultiplier: number
    fileLengthMultiplier: number
    selectedHeightMetric: string
    colorMetricMinThreshold: number
    colorMetricMaxThreshold: number
    currentFileName?: string
    fileContent?: string
}

@Injectable({
    providedIn: "root"
})
export class StorageService {
    private readonly STORAGE_KEY_PREFIX = "codeCharta_algoUi_"

    saveState(state: Partial<AlgoUiState>): void {
        for (const [key, value] of Object.entries(state)) {
            if (value !== undefined && value !== null) {
                localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${key}`, value.toString())
            }
        }
    }

    loadState(): Partial<AlgoUiState> {
        const state: Partial<AlgoUiState> = {}

        // Load all state properties
        const savedMargin = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}margin`)
        if (savedMargin !== null) {
            state.margin = Number.parseInt(savedMargin, 10)
        }

        const savedShowFloorLabels = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}showFloorLabels`)
        if (savedShowFloorLabels !== null) {
            state.showFloorLabels = savedShowFloorLabels === "true"
        }

        const savedAmountOfFloorLabels = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}amountOfFloorLabels`)
        if (savedAmountOfFloorLabels !== null) {
            state.amountOfFloorLabels = Number.parseInt(savedAmountOfFloorLabels, 10)
        }

        const savedFloorLabelSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}floorLabelSize`)
        if (savedFloorLabelSize !== null) {
            state.floorLabelLength = Number.parseFloat(savedFloorLabelSize)
        }

        const savedRenderLabelNames = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}renderLabelNames`)
        if (savedRenderLabelNames !== null) {
            state.renderLabelNames = savedRenderLabelNames === "true"
        }

        const savedAlgorithm = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}algorithm`)
        if (savedAlgorithm !== null && Object.values(LayoutAlgorithm).includes(savedAlgorithm as LayoutAlgorithm)) {
            state.selectedAlgorithm = savedAlgorithm as LayoutAlgorithm
        }

        const savedAreaMetric = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}areaMetric`)
        if (savedAreaMetric !== null) {
            state.selectedAreaMetric = savedAreaMetric
        }

        const savedSearchTerm = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}searchTerm`)
        if (savedSearchTerm !== null) {
            state.searchTerm = savedSearchTerm
        }

        const savedFilter = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}filter`)
        if (savedFilter !== null) {
            state.filter = savedFilter
        }

        const savedShowEvaluationMetrics = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}showEvaluationMetrics`)
        if (savedShowEvaluationMetrics !== null) {
            state.showEvaluationMetrics = savedShowEvaluationMetrics === "true"
        }

        const savedColorMode = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMode`)
        if (savedColorMode && Object.values(ColorMode).includes(savedColorMode as ColorMode)) {
            state.colorMode = savedColorMode as ColorMode
        }

        const savedColorMetric = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMetric`)
        if (savedColorMetric) {
            state.selectedColorMetric = savedColorMetric
        }

        const savedInvertColors = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}invertColors`)
        if (savedInvertColors !== null) {
            state.invertColors = savedInvertColors === "true"
        }

        const savedNodeNumberingActive = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}nodeNumberingActive`)
        if (savedNodeNumberingActive !== null) {
            state.isNodeNumberingActive = savedNodeNumberingActive === "true"
        }

        // Algorithm settings
        const savedNumberOfPasses = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}numberOfPasses`)
        if (savedNumberOfPasses !== null) {
            state.numberOfPasses = Number.parseInt(savedNumberOfPasses, 10)
        }

        const savedUseScale = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}useScale`)
        if (savedUseScale !== null) {
            state.useScale = savedUseScale === "true"
        }

        const savedUseSimpleIncreaseValues = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}useSimpleIncreaseValues`)
        if (savedUseSimpleIncreaseValues !== null) {
            state.useSimpleIncreaseValues = savedUseSimpleIncreaseValues === "true"
        }

        const savedOrderOption = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}selectedOrderOption`)
        if (savedOrderOption !== null && Object.values(OrderOption).includes(savedOrderOption as OrderOption)) {
            state.selectedOrderOption = savedOrderOption as OrderOption
        }

        const savedIncrementMargin = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}incrementMargin`)
        if (savedIncrementMargin !== null) {
            state.incrementMargin = savedIncrementMargin === "true"
        }

        const savedApplySiblingMargin = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}applySiblingMargin`)
        if (savedApplySiblingMargin !== null) {
            state.applySiblingMargin = savedApplySiblingMargin === "true"
        }

        const savedCollapseFolders = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}collapseFolders`)
        if (savedCollapseFolders !== null) {
            state.collapseFolders = savedCollapseFolders === "true"
        }

        const savedSorting = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}selectedSorting`)
        if (savedSorting !== null) {
            state.selectedSorting = savedSorting as SortingOption
        }

        // Node sizing
        const savedMinNodeSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}minNodeSize`)
        if (savedMinNodeSize !== null) {
            state.minNodeSize = Number.parseFloat(savedMinNodeSize)
        }

        const savedMaxNodeSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}maxNodeSize`)
        if (savedMaxNodeSize !== null) {
            state.maxNodeSize = Number.parseFloat(savedMaxNodeSize)
        }

        const savedMinFloorLabelSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}minFloorLabelSize`)
        if (savedMinFloorLabelSize !== null) {
            state.minFloorLabelSize = Number.parseFloat(savedMinFloorLabelSize)
        }

        const savedMaxFloorLabelSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}maxFloorLabelSize`)
        if (savedMaxFloorLabelSize !== null) {
            state.maxFloorLabelSize = Number.parseFloat(savedMaxFloorLabelSize)
        }

        // View settings
        const saved3DView = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}is3DView`)
        if (saved3DView !== null) {
            state.is3DView = saved3DView === "true"
        }

        const savedShowEdges = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}showEdges`)
        if (savedShowEdges !== null) {
            state.showEdges = savedShowEdges === "true"
        }

        const savedMaxSunburstRadius = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}maxSunburstRadius`)
        if (savedMaxSunburstRadius !== null) {
            state.maxSunburstRadius = Number.parseInt(savedMaxSunburstRadius, 10)
        }

        // Height and length multipliers
        const savedFolderHeightMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}folderHeightMultiplier`)
        if (savedFolderHeightMultiplier !== null) {
            state.folderHeightMultiplier = Number.parseFloat(savedFolderHeightMultiplier)
        }

        const savedLeafHeightMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}leafHeightMultiplier`)
        if (savedLeafHeightMultiplier !== null) {
            state.leafHeightMultiplier = Number.parseFloat(savedLeafHeightMultiplier)
        }

        const savedFolderLengthMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}folderLengthMultiplier`)
        if (savedFolderLengthMultiplier !== null) {
            state.folderLengthMultiplier = Number.parseFloat(savedFolderLengthMultiplier)
        }

        const savedFileLengthMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}fileLengthMultiplier`)
        if (savedFileLengthMultiplier !== null) {
            state.fileLengthMultiplier = Number.parseFloat(savedFileLengthMultiplier)
        }

        const savedHeightMetric = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}heightMetric`)
        if (savedHeightMetric) {
            state.selectedHeightMetric = savedHeightMetric
        }

        // Color metric thresholds
        const savedMinThreshold = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMetricMinThreshold`)
        if (savedMinThreshold !== null) {
            state.colorMetricMinThreshold = Number.parseFloat(savedMinThreshold)
        }

        const savedMaxThreshold = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMetricMaxThreshold`)
        if (savedMaxThreshold !== null) {
            state.colorMetricMaxThreshold = Number.parseFloat(savedMaxThreshold)
        }

        // File data
        const savedFileName = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}fileName`)
        const savedFileContent = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}fileContent`)
        if (savedFileName !== null && savedFileContent !== null) {
            state.currentFileName = savedFileName
            state.fileContent = savedFileContent
        }

        return state
    }

    clearLegacyKeys(): void {
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}keepOrder`)
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}nodeSizeMultiplier`)
    }
}
