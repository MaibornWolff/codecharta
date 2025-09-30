import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core"
import { CCFile, LayoutAlgorithm, Node, NodeMetricData } from "../../../codeCharta.model"
import { generateCCFileAndMetricData, generateNodes, getNumberOfZeroAreaNodes } from "./algo-nodeGenerator"
import { calculateEvaluationMetrics, EvaluationMetrics } from "./metricCalculation/metricCalculator"
import * as defaultCCJson from "../../../assets/sample1.cc.json"
import * as THREE from "three"
import { klona } from "klona"
import { STATE } from "../../dataMocks"
import { OrderOption, SortingOption } from "../squarifyLayoutImproved/squarify"

// Import the new services
import { VisualizationService } from "./services/visualization.service"
import { TreemapService } from "./services/treemap.service"
import { SunburstService } from "./services/sunburst.service"
import { CirclePackingService } from "./services/circle-packing.service"
import { CodeCityService } from "./services/codecity.service"
import { StreetMapService } from "./services/streetmap.service"

/**
 * Add enum for color modes
 */
export enum ColorMode {
    DEFAULT = "default",
    RANDOM = "random",
    METRIC = "metric"
}

@Component({
    selector: "test-ui",
    templateUrl: "./algo-ui.component.html",
    styleUrls: ["./algo-ui.component.scss"]
})
export class AlgoUiComponent implements OnInit, OnDestroy {
    @ViewChild("threeContainer", { static: true }) containerRef: ElementRef<HTMLDivElement>

    // UI State properties
    hoveredNode: Node | null = null
    currentFileName: string = null
    margin = 10
    showFloorLabels = true
    amountOfFloorLabels = 2
    floorLabelLength = 1
    renderLabelNames = true
    numberOfZeroAreaNodes = 0
    layoutAlgorithms = Object.values(LayoutAlgorithm)
    selectedAlgorithm: LayoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap
    availableAreaMetrics: string[] = []
    selectedAreaMetric = "rloc"
    searchTerm = ""
    isLoading = false
    evaluationMetrics: EvaluationMetrics = null
    showEvaluationMetrics = true
    is3DView = false
    showEdges = false
    filter = ""

    // Algorithm settings for Improved Squarify
    numberOfPasses = 1
    useScale = false
    useSimpleIncreaseValues = false
    selectedOrderOption: OrderOption = OrderOption.NEW_ORDER
    incrementMargin = false
    applySiblingMargin = true
    sortingOptions = Object.values(SortingOption)
    orderOptions = Object.values(OrderOption)
    selectedSorting: SortingOption = SortingOption.NONE

    // Visual settings
    collapseFolders = false
    selectedColorMode: ColorMode = ColorMode.DEFAULT
    selectedColorMetric = ""
    availableColorMetrics: string[] = []
    maxSunburstRadius = 240
    invertColors = false
    folderHeightMultiplier = 1.0
    leafHeightMultiplier = 1.0
    folderLengthMultiplier = 1.0
    fileLengthMultiplier = 1.0
    selectedHeightMetric = ""
    availableHeightMetrics: string[] = []
    colorMetricMinThreshold = 0
    colorMetricMaxThreshold = 100

    protected readonly ColorMode = ColorMode
    protected readonly Object = Object

    // Private properties
    private searchHighlightedMeshes: THREE.Mesh[] = []
    private isNodeNumberingActive = false
    private nodeNumberLabels: THREE.Sprite[] = []
    private nodes: Node[] = []
    private nodeObjects: THREE.Mesh[] = []
    private edgeObjects: THREE.Line[] = []
    private viewSize: number
    private lastProcessedJson: any = null
    private hoveredMesh: THREE.Mesh | null = null
    private readonly ccState = klona(STATE)
    private ccFile: CCFile
    private metricData: NodeMetricData[] = []
    private minNodeSize = 1
    private maxNodeSize = 25
    private minFloorLabelSize = 0.5
    private maxFloorLabelSize = 10
    private floorLabelSprites: THREE.Sprite[] = []
    // Add the storage key prefix constant that was referenced in the old methods
    private readonly STORAGE_KEY_PREFIX = "codeCharta_algoUi_"

    constructor(
        private visualizationService: VisualizationService,
        private treemapService: TreemapService,
        private sunburstService: SunburstService,
        private circlePackingService: CirclePackingService,
        private codeCityService: CodeCityService,
        private streetMapService: StreetMapService
    ) {}

    ngOnInit() {
        this.loadStateFromLocalStorage()
        this.initThreeJs()
        this.generateAndRenderNodes()
        this.applyCurrentColorMode()
        if (this.isNodeNumberingActive) {
            this.toggleNodeNumbering()
        }
        this.visualizationService.setActiveCamera(this.is3DView, this.viewSize)
        this.animate()
        window.addEventListener("mousedown", this.onMouseDown.bind(this))
    }

    ngOnDestroy() {
        window.removeEventListener("mousedown", this.onMouseDown.bind(this))
        this.containerRef.nativeElement.removeEventListener("mousemove", this.onMouseMove.bind(this))
        this.visualizationService.dispose()
    }

    @HostListener("window:resize", ["$event"])
    onResize() {
        const renderer = this.visualizationService.getRenderer()
        if (!renderer) {
            return
        }
        const container = this.containerRef.nativeElement
        renderer.setSize(container.clientWidth, container.clientHeight)
        this.visualizationService.updateDimensions(container, this.viewSize, this.is3DView)

        if (this.isNodeNumberingActive) {
            this.clearNodeNumbers()
            this.toggleNodeNumbering()
        }
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: KeyboardEvent) {
        if (event.metaKey) {
            this.handleMetaKeyShortcuts(event)
            return
        }

        if (event.key.startsWith("Arrow")) {
            this.handleArrowKeys(event)
        }
    }

    // Event handlers
    toggleEvaluationMetricsVisibility() {
        this.showEvaluationMetrics = !this.showEvaluationMetrics
        this.saveStateToLocalStorage()
    }

    onSwitchViewChange() {
        this.visualizationService.setActiveCamera(this.is3DView, this.viewSize)
        this.visualizationService.updateDimensions(this.containerRef.nativeElement, this.viewSize, this.is3DView)
        this.visualizationService.updateLighting(this.is3DView)
        this.saveStateToLocalStorage()
    }

    onFileUpload(event: any) {
        const file = event.target.files[0]
        if (file) {
            this.currentFileName = file.name
            this.loadAndRenderJson(file)
        }
    }

    onMarginChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onAlgorithmChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onFloorLabelsChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onFloorLabelLengthChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onRenderLabelNamesChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onAreaMetricChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onSearchChange() {
        this.saveStateToLocalStorage()
        this.updateSearchHighlighting()
    }

    onAlgorithmSettingsChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()

        if (this.searchTerm?.trim()) {
            this.updateSearchHighlighting()
        }
    }

    onColorMetricChange() {
        this.saveStateToLocalStorage()
        if (this.selectedColorMode === ColorMode.METRIC) {
            this.applyMetricColoring()
        }
    }

    onInvertColorsChange() {
        this.invertColors = !this.invertColors
        this.saveStateToLocalStorage()
        if (this.selectedColorMode === ColorMode.METRIC) {
            this.applyMetricColoring()
        }
    }

    onHeightMetricChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onShowEdgesChange() {
        this.saveStateToLocalStorage()
        this.updateEdges()
    }

    onMaxSunburstRadiusChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onFilterChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onHeightChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    onLengthChange() {
        this.saveStateToLocalStorage()
        this.regenerateNodes()
    }

    public onColorModeChange() {
        this.applyCurrentColorMode()
        this.saveStateToLocalStorage()
    }

    public calculateAreaSizeValueRatio(node: Node): number {
        if (this.selectedAlgorithm === LayoutAlgorithm.Sunburst) {
            if (!node.attributes || !node.attributes[this.selectedAreaMetric]) {
                return 0
            }

            const maxWidth = Math.max(...this.nodes.map(n => n.width))
            const radiusFactor = (this.maxSunburstRadius / maxWidth / 360) * Math.PI * 2
            const widthAngle = node.width * radiusFactor
            const innerRadius = node.y0
            const outerRadius = node.y0 + node.length
            const segmentArea = (widthAngle / (2 * Math.PI)) * Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2))
            return segmentArea / node.attributes[this.selectedAreaMetric]
        }

        if (this.selectedAlgorithm === LayoutAlgorithm.CirclePacking) {
            return (Math.PI * Math.pow(node.width, 2)) / node.attributes[this.selectedAreaMetric]
        }

        return (node.width * node.length) / node.attributes[this.selectedAreaMetric]
    }

    public calculateAreaSize(node: Node): number {
        if (this.selectedAlgorithm === LayoutAlgorithm.Sunburst) {
            const maxWidth = Math.max(...this.nodes.map(n => n.width))
            const radiusFactor = (this.maxSunburstRadius / maxWidth / 360) * Math.PI * 2
            const widthAngle = node.width * radiusFactor
            const innerRadius = node.y0
            const outerRadius = node.y0 + node.length
            return (widthAngle / (2 * Math.PI)) * Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2))
        }

        if (this.selectedAlgorithm === LayoutAlgorithm.CirclePacking) {
            return Math.PI * Math.pow(node.width, 2)
        }

        return node.width * node.length
    }

    onColorThresholdChange() {
        if (this.colorMetricMinThreshold > this.colorMetricMaxThreshold) {
            this.colorMetricMinThreshold = this.colorMetricMaxThreshold
        }

        this.saveStateToLocalStorage()
        if (this.selectedColorMode === ColorMode.METRIC) {
            this.applyMetricColoring()
        }
    }

    // Private methods
    private initThreeJs() {
        const container = this.containerRef.nativeElement
        this.visualizationService.initThreeJs(container)
        this.visualizationService.updateLighting(this.is3DView)
        this.containerRef.nativeElement.addEventListener("mousemove", this.onMouseMove.bind(this))
    }

    private loadAndRenderJson(file: Blob) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            try {
                this.lastProcessedJson = e.target.result
                const { ccFile, metricData } = generateCCFileAndMetricData(
                    this.ccState,
                    this.lastProcessedJson,
                    this.lastProcessedJson.length
                )
                this.ccFile = ccFile
                this.metricData = metricData
                this.loadAvailableAreaMetrics()
                this.generateAndRenderNodes()
                this.saveStateToLocalStorage()
            } catch (error) {
                console.error("Error processing file:", error)
                alert("Error processing the file. Check console for details.")
            }
        }
        reader.readAsText(file)
    }

    private clearScene() {
        this.hoveredMesh = null
        this.hoveredNode = null
        this.searchHighlightedMeshes = []

        this.clearNodeNumbers()
        this.clearFloorLabels()

        // Clear edge objects
        for (const edge of this.edgeObjects) {
            this.visualizationService.getScene().remove(edge)
        }
        this.edgeObjects = []

        for (const obj of this.nodeObjects) {
            this.visualizationService.getScene().remove(obj)
        }
        this.nodeObjects = []

        this.visualizationService.clearScene()
    }

    private generateAndRenderNodes() {
        this.isLoading = true
        try {
            this.clearScene()
            this.evaluationMetrics = null

            this.nodes = generateNodes(
                this.ccState,
                this.ccFile.map,
                this.metricData,
                this.selectedAreaMetric,
                this.margin,
                this.selectedAlgorithm,
                this.showFloorLabels,
                this.amountOfFloorLabels,
                this.numberOfPasses,
                this.useScale,
                this.useSimpleIncreaseValues,
                this.selectedSorting,
                this.selectedOrderOption,
                this.incrementMargin,
                this.applySiblingMargin,
                this.collapseFolders,
                this.filter,
                this.floorLabelLength,
                1
            )

            const heightMultipliers = this.selectedHeightMetric ? this.calculateHeightMultipliers(this.nodes) : new Map()

            // Use appropriate service based on algorithm
            if (this.selectedAlgorithm === LayoutAlgorithm.Sunburst) {
                const result = this.sunburstService.renderNodes(
                    this.nodes,
                    this.visualizationService.getScene(),
                    this.is3DView,
                    this.maxSunburstRadius,
                    this.folderHeightMultiplier,
                    this.leafHeightMultiplier,
                    this.folderLengthMultiplier,
                    this.fileLengthMultiplier,
                    this.selectedHeightMetric,
                    heightMultipliers
                )
                this.nodeObjects = result.nodeObjects
                this.viewSize = result.viewSize
            } else if (this.selectedAlgorithm === LayoutAlgorithm.CirclePacking) {
                const result = this.circlePackingService.renderNodes(
                    this.nodes,
                    this.visualizationService.getScene(),
                    this.leafHeightMultiplier,
                    this.folderHeightMultiplier,
                    this.selectedHeightMetric,
                    heightMultipliers
                )
                this.nodeObjects = result.nodeObjects
                this.viewSize = result.viewSize
            } else {
                // Default to treemap for other algorithms
                this.visualizationService.getScene().rotation.z = 0
                this.nodeObjects = this.treemapService.renderNodes(
                    this.nodes,
                    this.visualizationService.getScene(),
                    this.is3DView,
                    this.folderHeightMultiplier,
                    this.leafHeightMultiplier,
                    this.selectedHeightMetric,
                    heightMultipliers
                )

                const maxWidth = Math.max(...this.nodes.map(node => node.x0 + node.width))
                const maxLength = Math.max(...this.nodes.map(node => node.y0 + node.length))
                this.viewSize = Math.min(maxWidth, maxLength)
            }

            if (this.showFloorLabels) {
                this.addFloorLabels()
            }

            this.visualizationService.updateDimensions(this.containerRef.nativeElement, this.viewSize, this.is3DView)

            this.numberOfZeroAreaNodes = getNumberOfZeroAreaNodes(this.nodes, this.selectedAreaMetric).numberOfZeroAreaNodes

            if (this.searchTerm) {
                this.updateSearchHighlighting()
            }

            this.applyCurrentColorMode()

            if (this.isNodeNumberingActive) {
                this.toggleNodeNumbering()
            }

            this.evaluationMetrics = calculateEvaluationMetrics(
                this.ccState,
                this.margin,
                this.selectedAlgorithm,
                this.ccFile.map,
                this.selectedAreaMetric,
                this.metricData,
                this.numberOfPasses,
                this.useScale,
                this.useSimpleIncreaseValues,
                this.selectedSorting,
                this.selectedOrderOption,
                this.incrementMargin,
                this.applySiblingMargin,
                this.collapseFolders,
                this.filter,
                this.showFloorLabels,
                this.amountOfFloorLabels,
                this.floorLabelLength,
                1
            )

            this.visualizationService.setActiveCamera(this.is3DView, this.viewSize)
        } finally {
            this.isLoading = false
        }
    }

    private regenerateNodes() {
        if (this.lastProcessedJson) {
            this.generateAndRenderNodes()
        }
    }

    private animate() {
        requestAnimationFrame(() => this.animate())
        this.visualizationService.getControls().update()
        this.visualizationService.render()
    }

    private onMouseMove(event: MouseEvent) {
        this.visualizationService.onMouseMove(
            event,
            this.containerRef.nativeElement,
            this.nodeObjects,
            (node: Node | null, mesh: THREE.Mesh | null) => {
                if (this.hoveredMesh && this.hoveredMesh !== mesh) {
                    this.visualizationService.unhighlightNode(this.hoveredMesh, this.searchHighlightedMeshes.includes(this.hoveredMesh))
                }

                this.hoveredNode = node
                this.hoveredMesh = mesh

                if (mesh) {
                    this.visualizationService.highlightNode(mesh, this.searchHighlightedMeshes.includes(mesh))
                }
            }
        )
    }

    private updateSearchHighlighting() {
        this.searchHighlightedMeshes = this.visualizationService.updateSearchHighlighting(this.searchTerm, this.nodeObjects)
    }

    private applyCurrentColorMode() {
        if (this.selectedColorMode === ColorMode.DEFAULT) {
            this.visualizationService.restoreLavaColoring(this.nodeObjects, this.nodes)
        } else if (this.selectedColorMode === ColorMode.RANDOM) {
            this.visualizationService.colorNodesRandomly(this.nodeObjects, this.nodes)
        } else if (this.selectedColorMode === ColorMode.METRIC) {
            this.applyMetricColoring()
        }

        if (this.showEdges) {
            this.updateEdges()
        }
    }

    private applyMetricColoring() {
        this.visualizationService.applyMetricColoring(
            this.nodeObjects,
            this.nodes,
            this.selectedColorMetric,
            this.colorMetricMinThreshold,
            this.colorMetricMaxThreshold,
            this.invertColors
        )
    }

    private updateEdges() {
        // Remove existing edges first
        for (const edge of this.edgeObjects) {
            this.visualizationService.getScene().remove(edge)
        }
        this.edgeObjects = []

        if (!this.showEdges) {
            return
        }

        for (const mesh of this.nodeObjects) {
            const node = mesh.userData.nodeData as Node
            /*if(!node.isLeaf) {
                continue
            }*/

            if (this.selectedAlgorithm === LayoutAlgorithm.Sunburst) {
                const edge = this.sunburstService.addSunburstEdges(mesh, node, this.visualizationService.getScene())
                this.edgeObjects.push(edge)
            } else if (this.selectedAlgorithm === LayoutAlgorithm.CirclePacking) {
                const edge = this.circlePackingService.addCirclePackingEdges(mesh, node, this.visualizationService.getScene())
                this.edgeObjects.push(edge)
            } else {
                const edge = this.treemapService.addBoxEdges(mesh, this.visualizationService.getScene())
                this.edgeObjects.push(edge)
            }
        }
    }

    private addFloorLabels() {
        this.clearFloorLabels()

        if (this.selectedAlgorithm === LayoutAlgorithm.Sunburst) {
            this.sunburstService.addSunburstFloorLabels(
                this.nodes,
                this.nodeObjects,
                this.visualizationService,
                this.floorLabelLength,
                this.amountOfFloorLabels,
                this.renderLabelNames,
                this.floorLabelSprites,
                this.minFloorLabelSize,
                this.maxFloorLabelSize
            )
        } else if (this.selectedAlgorithm === LayoutAlgorithm.CirclePacking) {
            this.circlePackingService.addCirclePackingFloorLabels(
                this.nodeObjects,
                this.nodes,
                this.visualizationService,
                this.floorLabelLength,
                this.amountOfFloorLabels,
                this.renderLabelNames,
                this.floorLabelSprites,
                this.minFloorLabelSize,
                this.maxFloorLabelSize
            )
        } else if (this.selectedAlgorithm === LayoutAlgorithm.StreetMap) {
            this.streetMapService.addStreetMapFloorLabels(
                this.nodeObjects,
                this.nodes,
                this.visualizationService,
                this.floorLabelLength,
                this.amountOfFloorLabels,
                this.renderLabelNames,
                this.floorLabelSprites,
                this.minFloorLabelSize,
                this.maxFloorLabelSize,
                this.folderHeightMultiplier
            )
        } else if (this.selectedAlgorithm === LayoutAlgorithm.CodeCity) {
            this.codeCityService.addCodeCityFloorLabels(
                this.nodes,
                this.nodeObjects,
                this.visualizationService,
                this.floorLabelLength,
                this.amountOfFloorLabels,
                this.renderLabelNames,
                this.folderHeightMultiplier,
                this.floorLabelSprites,
                this.margin,
                this.minFloorLabelSize,
                this.maxFloorLabelSize
            )
        } else {
            this.treemapService.addTreemapFloorLabels(
                this.nodeObjects,
                this.nodes,
                this.visualizationService,
                this.floorLabelLength,
                this.amountOfFloorLabels,
                this.renderLabelNames,
                this.floorLabelSprites,
                this.minFloorLabelSize,
                this.maxFloorLabelSize,
                this.folderHeightMultiplier
            )
        }
    }

    private clearFloorLabels() {
        for (const label of this.floorLabelSprites) {
            this.visualizationService.getScene().remove(label)
        }
        this.floorLabelSprites = []
    }

    private loadStateFromLocalStorage() {
        const savedMargin = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}margin`)
        if (savedMargin !== null) {
            this.margin = Number.parseInt(savedMargin, 10)
        }

        const savedShowFloorLabels = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}showFloorLabels`)
        if (savedShowFloorLabels !== null) {
            this.showFloorLabels = savedShowFloorLabels === "true"
        }

        const savedAmountOfFloorLabels = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}amountOfFloorLabels`)
        if (savedAmountOfFloorLabels !== null) {
            this.amountOfFloorLabels = Number.parseInt(savedAmountOfFloorLabels, 10)
        }

        const savedFloorLabelSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}floorLabelSize`)
        if (savedFloorLabelSize !== null) {
            this.floorLabelLength = Number.parseFloat(savedFloorLabelSize)
        }

        const savedRenderLabelNames = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}renderLabelNames`)
        if (savedRenderLabelNames !== null) {
            this.renderLabelNames = savedRenderLabelNames === "true"
        }

        const savedAlgorithm = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}algorithm`)
        if (savedAlgorithm !== null && Object.values(LayoutAlgorithm).includes(savedAlgorithm as LayoutAlgorithm)) {
            this.selectedAlgorithm = savedAlgorithm as LayoutAlgorithm
        }

        const savedAreaMetric = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}areaMetric`)
        if (savedAreaMetric !== null) {
            this.selectedAreaMetric = savedAreaMetric
        }

        const savedFileName = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}fileName`)
        const savedFileContent = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}fileContent`)
        if (savedFileName !== null && savedFileContent !== null) {
            this.currentFileName = savedFileName
            this.lastProcessedJson = savedFileContent
        } else {
            this.currentFileName = "artificial.cc.json (default)"
            this.lastProcessedJson = JSON.stringify(defaultCCJson)
        }

        const savedSearchTerm = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}searchTerm`)
        if (savedSearchTerm !== null) {
            this.searchTerm = savedSearchTerm
        }

        const savedFilter = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}filter`)
        if (savedFilter !== null) {
            this.filter = savedFilter
        }

        // Load evaluation metrics visibility state
        const savedShowEvaluationMetrics = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}showEvaluationMetrics`)
        if (savedShowEvaluationMetrics !== null) {
            this.showEvaluationMetrics = savedShowEvaluationMetrics === "true"
        }

        // Load color mode state
        const savedColorMode = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMode`)
        if (savedColorMode && Object.values(ColorMode).includes(savedColorMode as ColorMode)) {
            this.selectedColorMode = savedColorMode as ColorMode
        }

        const savedColorMetric = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMetric`)
        if (savedColorMetric) {
            this.selectedColorMetric = savedColorMetric
        }

        // Load invert colors state
        const savedInvertColors = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}invertColors`)
        if (savedInvertColors !== null) {
            this.invertColors = savedInvertColors === "true"
        }

        // Load node numbering state
        const savedNodeNumberingActive = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}nodeNumberingActive`)
        if (savedNodeNumberingActive !== null) {
            this.isNodeNumberingActive = savedNodeNumberingActive === "true"
        }

        // Load algorithm settings
        const savedNumberOfPasses = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}numberOfPasses`)
        if (savedNumberOfPasses !== null) {
            this.numberOfPasses = Number.parseInt(savedNumberOfPasses, 10)
        }

        const savedUseScale = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}useScale`)
        if (savedUseScale !== null) {
            this.useScale = savedUseScale === "true"
        }

        const savedUseSimpleIncreaseValues = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}useSimpleIncreaseValues`)
        if (savedUseSimpleIncreaseValues !== null) {
            this.useSimpleIncreaseValues = savedUseSimpleIncreaseValues === "true"
        }

        // Load selectedOrderOption setting instead of keepOrder
        const savedOrderOption = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}selectedOrderOption`)
        if (savedOrderOption !== null && Object.values(OrderOption).includes(savedOrderOption as OrderOption)) {
            this.selectedOrderOption = savedOrderOption as OrderOption
        } else {
            // Legacy support: Convert old keepOrder boolean to new OrderOption enum
            const savedKeepOrder = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}keepOrder`)
            if (savedKeepOrder === "true") {
                this.selectedOrderOption = OrderOption.KEEP_PLACE
            } else if (savedKeepOrder === "false") {
                this.selectedOrderOption = OrderOption.NEW_ORDER
            }
        }

        // Load incrementMargin setting
        const savedIncrementMargin = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}incrementMargin`)
        if (savedIncrementMargin !== null) {
            this.incrementMargin = savedIncrementMargin === "true"
        }

        // Load applySiblingMargin setting
        const savedApplySiblingMargin = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}applySiblingMargin`)
        if (savedApplySiblingMargin !== null) {
            this.applySiblingMargin = savedApplySiblingMargin === "true"
        }

        // Load collapseFolders setting
        const savedCollapseFolders = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}collapseFolders`)
        if (savedCollapseFolders !== null) {
            this.collapseFolders = savedCollapseFolders === "true"
        }

        const savedSorting = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}selectedSorting`)
        if (savedSorting !== null) {
            this.selectedSorting = savedSorting as SortingOption
        }

        // Load min and max node size settings
        const savedMinNodeSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}minNodeSize`)
        if (savedMinNodeSize !== null) {
            this.minNodeSize = Number.parseFloat(savedMinNodeSize)
        }

        const savedMaxNodeSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}maxNodeSize`)
        if (savedMaxNodeSize !== null) {
            this.maxNodeSize = Number.parseFloat(savedMaxNodeSize)
        }

        // Load min and max floor label size settings
        const savedMinFloorLabelSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}minFloorLabelSize`)
        if (savedMinFloorLabelSize !== null) {
            this.minFloorLabelSize = Number.parseFloat(savedMinFloorLabelSize)
        }

        const savedMaxFloorLabelSize = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}maxFloorLabelSize`)
        if (savedMaxFloorLabelSize !== null) {
            this.maxFloorLabelSize = Number.parseFloat(savedMaxFloorLabelSize)
        }

        // Load 3D view state
        const saved3DView = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}is3DView`)
        if (saved3DView !== null) {
            this.is3DView = saved3DView === "true"
        }

        // Load show edges state
        const savedShowEdges = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}showEdges`)
        if (savedShowEdges !== null) {
            this.showEdges = savedShowEdges === "true"
        }

        const savedMaxSunburstRadius = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}maxSunburstRadius`)
        if (savedMaxSunburstRadius !== null) {
            this.maxSunburstRadius = Number.parseInt(savedMaxSunburstRadius, 10)
        }

        // Load height multipliers
        const savedFolderHeightMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}folderHeightMultiplier`)
        if (savedFolderHeightMultiplier !== null) {
            this.folderHeightMultiplier = Number.parseFloat(savedFolderHeightMultiplier)
        }

        const savedLeafHeightMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}leafHeightMultiplier`)
        if (savedLeafHeightMultiplier !== null) {
            this.leafHeightMultiplier = Number.parseFloat(savedLeafHeightMultiplier)
        }

        // Load length multipliers
        const savedFolderLengthMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}folderLengthMultiplier`)
        if (savedFolderLengthMultiplier !== null) {
            this.folderLengthMultiplier = Number.parseFloat(savedFolderLengthMultiplier)
        }

        const savedFileLengthMultiplier = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}fileLengthMultiplier`)
        if (savedFileLengthMultiplier !== null) {
            this.fileLengthMultiplier = Number.parseFloat(savedFileLengthMultiplier)
        }

        // Load height metric state
        const savedHeightMetric = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}heightMetric`)
        if (savedHeightMetric) {
            this.selectedHeightMetric = savedHeightMetric
        }

        // Load color metric thresholds
        const savedMinThreshold = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMetricMinThreshold`)
        if (savedMinThreshold !== null) {
            this.colorMetricMinThreshold = Number.parseFloat(savedMinThreshold)
        }

        const savedMaxThreshold = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}colorMetricMaxThreshold`)
        if (savedMaxThreshold !== null) {
            this.colorMetricMaxThreshold = Number.parseFloat(savedMaxThreshold)
        }

        const { ccFile, metricData } = generateCCFileAndMetricData(this.ccState, this.lastProcessedJson, this.lastProcessedJson.length)
        this.ccFile = ccFile
        this.metricData = metricData
        this.loadAvailableAreaMetrics()
    }

    private saveStateToLocalStorage() {
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}margin`, this.margin.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}showFloorLabels`, this.showFloorLabels.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}amountOfFloorLabels`, this.amountOfFloorLabels.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}floorLabelSize`, this.floorLabelLength.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}renderLabelNames`, this.renderLabelNames.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}algorithm`, this.selectedAlgorithm)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}areaMetric`, this.selectedAreaMetric)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}searchTerm`, this.searchTerm)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}filter`, this.filter)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}showEvaluationMetrics`, this.showEvaluationMetrics.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}colorMode`, this.selectedColorMode)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}colorMetric`, this.selectedColorMetric)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}invertColors`, this.invertColors.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}nodeNumberingActive`, this.isNodeNumberingActive.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}numberOfPasses`, this.numberOfPasses.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}useScale`, this.useScale.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}useSimpleIncreaseValues`, this.useSimpleIncreaseValues.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}selectedOrderOption`, this.selectedOrderOption) // Save selectedOrderOption instead of keepOrder
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}incrementMargin`, this.incrementMargin.toString()) // Save incrementMargin setting
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}applySiblingMargin`, this.applySiblingMargin.toString()) // Save applySiblingMargin setting
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}collapseFolders`, this.collapseFolders.toString()) // Save collapseFolders setting
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}selectedSorting`, this.selectedSorting)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}minNodeSize`, this.minNodeSize.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}maxNodeSize`, this.maxNodeSize.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}minFloorLabelSize`, this.minFloorLabelSize.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}maxFloorLabelSize`, this.maxFloorLabelSize.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}is3DView`, this.is3DView.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}showEdges`, this.showEdges.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}maxSunburstRadius`, this.maxSunburstRadius.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}folderHeightMultiplier`, this.folderHeightMultiplier.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}leafHeightMultiplier`, this.leafHeightMultiplier.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}folderLengthMultiplier`, this.folderLengthMultiplier.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}fileLengthMultiplier`, this.fileLengthMultiplier.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}heightMetric`, this.selectedHeightMetric)
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}colorMetricMinThreshold`, this.colorMetricMinThreshold.toString())
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}colorMetricMaxThreshold`, this.colorMetricMaxThreshold.toString())
        // Remove old keepOrder if it exists
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}keepOrder`)
        // Remove old nodeSizeMultiplier if it exists
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}nodeSizeMultiplier`)
        if (this.currentFileName !== "artificial.cc.json (default)") {
            localStorage.setItem(`${this.STORAGE_KEY_PREFIX}fileName`, this.currentFileName)
            localStorage.setItem(`${this.STORAGE_KEY_PREFIX}fileContent`, this.lastProcessedJson)
        }
    }

    private handleMetaKeyShortcuts(event: KeyboardEvent) {
        // Handle Cmd+Arrow keys for floor label sizing
        if (event.key.startsWith("Arrow")) {
            this.handleFloorLabelSizing(event)
            event.preventDefault()
            return
        }

        switch (event.key) {
            case "h":
                this.toggleColorMode()
                break
            case "g":
                this.takeScreenshot()
                break
            case "j":
                this.toggleEvaluationMetricsVisibility()
                break
            case "k":
                this.toggleNodeNumbers()
                break
        }
    }

    private toggleColorMode() {
        // Rotate through three color modes
        if (this.selectedColorMode === ColorMode.DEFAULT) {
            this.selectedColorMode = ColorMode.RANDOM
        } else if (this.selectedColorMode === ColorMode.RANDOM) {
            this.selectedColorMode = ColorMode.METRIC
        } else {
            this.selectedColorMode = ColorMode.DEFAULT
        }
        this.applyCurrentColorMode()
        this.saveStateToLocalStorage()
    }

    private loadAvailableAreaMetrics() {
        if (this.lastProcessedJson) {
            this.availableAreaMetrics = this.metricData.map(metric => metric.name)
            if (this.availableAreaMetrics.includes("rloc")) {
                this.selectedAreaMetric = "rloc"
            } else {
                this.selectedAreaMetric = this.availableAreaMetrics[0]
            }
            // Also update available color metrics and height metrics
            this.availableColorMetrics = [...this.availableAreaMetrics]
            this.availableHeightMetrics = [...this.availableAreaMetrics]
            if (!this.selectedColorMetric && this.availableColorMetrics.length > 0) {
                this.selectedColorMetric = this.availableColorMetrics[0]
            }
            if (!this.selectedHeightMetric && this.availableHeightMetrics.length > 0) {
                // Don't auto-select a height metric, leave it as "None" by default
                this.selectedHeightMetric = ""
            }
        }
    }

    private toggleNodeNumbers() {
        this.isNodeNumberingActive = !this.isNodeNumberingActive
        this.toggleNodeNumbering()
        this.saveStateToLocalStorage()
    }

    private handleArrowKeys(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowUp":
                this.increaseMaxNodeSize()
                break
            case "ArrowDown":
                this.decreaseMaxNodeSize()
                break
            case "ArrowLeft":
                this.decreaseMinNodeSize()
                break
            case "ArrowRight":
                this.increaseMinNodeSize()
                break
        }

        // Refresh node number display if active
        if (this.isNodeNumberingActive) {
            this.toggleNodeNumbering()
        }

        event.preventDefault()
    }

    private handleFloorLabelSizing(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowUp":
                this.increaseMaxFloorLabelSize()
                break
            case "ArrowDown":
                this.decreaseMaxFloorLabelSize()
                break
            case "ArrowLeft":
                this.decreaseMinFloorLabelSize()
                break
            case "ArrowRight":
                this.increaseMinFloorLabelSize()
                break
        }

        // Refresh floor labels if they are active
        if (this.showFloorLabels) {
            this.addFloorLabels()
        }

        this.saveStateToLocalStorage()
    }

    private increaseMaxNodeSize() {
        this.maxNodeSize += 1
    }

    private decreaseMaxNodeSize() {
        this.maxNodeSize = Math.max(this.maxNodeSize - 1, 1.1)
        // Ensure minimum size doesn't exceed maximum
        this.minNodeSize = Math.min(this.maxNodeSize - 1, this.minNodeSize)
    }

    private decreaseMinNodeSize() {
        this.minNodeSize = Math.max(0.1, this.minNodeSize - 0.5)
    }

    private increaseMinNodeSize() {
        this.minNodeSize += 0.5
        // Ensure maximum size stays above minimum
        this.maxNodeSize = Math.max(this.minNodeSize + 1, this.maxNodeSize)
    }

    private increaseMaxFloorLabelSize() {
        this.maxFloorLabelSize += 0.5
    }

    private decreaseMaxFloorLabelSize() {
        this.maxFloorLabelSize = Math.max(this.maxFloorLabelSize - 0.5, 0.6)
        // Ensure minimum size doesn't exceed maximum
        this.minFloorLabelSize = Math.min(this.maxFloorLabelSize - 0.1, this.minFloorLabelSize)
    }

    private decreaseMinFloorLabelSize() {
        this.minFloorLabelSize = Math.max(0.1, this.minFloorLabelSize - 0.1)
    }

    private increaseMinFloorLabelSize() {
        this.minFloorLabelSize += 0.1
        // Ensure maximum size stays above minimum
        this.maxFloorLabelSize = Math.max(this.minFloorLabelSize + 0.1, this.maxFloorLabelSize)
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button === 1) {
            // Middle mouse button
            this.toggleEvaluationMetricsVisibility()
        }
    }

    private takeScreenshot() {
        this.visualizationService.takeScreenshot(this.containerRef.nativeElement, this.viewSize, this.is3DView)
    }

    private calculateHeightMultipliers(nodes: Node[]): Map<Node, number> {
        const heightMultipliers = new Map<Node, number>()

        // Only calculate for leaf nodes
        const leafNodes = nodes.filter(node => node.isLeaf)
        if (leafNodes.length === 0) {
            return heightMultipliers
        }

        // Get metric values for all leaf nodes
        const metricValues = leafNodes.map(node => node.attributes?.[this.selectedHeightMetric] ?? 0)
        const minValue = Math.min(...metricValues)
        const maxValue = Math.max(...metricValues)
        const valueRange = maxValue - minValue || 1

        // Calculate multipliers (range from 0.1 to 3.0)
        const minMultiplier = 0.1
        const maxMultiplier = 3.0
        const multiplierRange = maxMultiplier - minMultiplier

        for (const node of leafNodes) {
            const value = node.attributes?.[this.selectedHeightMetric] ?? 0
            const normalizedValue = (value - minValue) / valueRange
            const multiplier = minMultiplier + normalizedValue * multiplierRange
            heightMultipliers.set(node, multiplier)
        }

        return heightMultipliers
    }

    private toggleNodeNumbering() {
        this.clearNodeNumbers()

        if (!this.isNodeNumberingActive) {
            return
        }

        const leafNodes = this.nodeObjects.filter(obj => {
            const node = obj.userData.nodeData as Node
            return node.isLeaf
        })

        // Create numbered labels for each non-zero leaf node
        leafNodes.forEach((mesh, index) => {
            const node = mesh.userData.nodeData as Node
            const label = this.createNodeNumberLabel(index + 1, mesh)
            if (node.width <= 0 || node.length <= 0) {
                return
            }
            this.nodeNumberLabels.push(label)
            this.visualizationService.getScene().add(label)
        })
    }

    private clearNodeNumbers() {
        // Remove any existing number labels
        for (const label of this.nodeNumberLabels) {
            this.visualizationService.getScene().remove(label)
        }
        this.nodeNumberLabels = []
    }

    private createNodeNumberLabel(number: number, nodeMesh: THREE.Mesh): THREE.Sprite {
        const numberStr = String(number)

        const baseHeight = 512
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            const dummyTex = new THREE.CanvasTexture(document.createElement("canvas"))
            const dummyMat = new THREE.SpriteMaterial({ map: dummyTex, transparent: true })
            return new THREE.Sprite(dummyMat)
        }

        canvas.height = baseHeight
        const fontSize = baseHeight * 0.7
        const lineWidth = Math.round(baseHeight * 0.07)
        const padding = Math.round(baseHeight * 0.15)

        ctx.font = `bold ${fontSize}px Arial, sans-serif`

        const metrics = ctx.measureText(numberStr)
        const textWidth =
            metrics.actualBoundingBoxLeft !== undefined && metrics.actualBoundingBoxRight !== undefined
                ? metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
                : metrics.width

        canvas.width = Math.ceil(textWidth + padding * 2 + lineWidth * 2)

        const ctx2 = canvas.getContext("2d")!
        ctx2.clearRect(0, 0, canvas.width, canvas.height)
        ctx2.font = `bold ${fontSize}px Arial, sans-serif`
        ctx2.textAlign = "center"
        ctx2.textBaseline = "middle"
        ctx2.lineWidth = lineWidth

        ctx2.strokeStyle = "black"
        ctx2.strokeText(numberStr, canvas.width / 2, canvas.height / 2)

        ctx2.fillStyle = "white"
        ctx2.fillText(numberStr, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false })
        const sprite = new THREE.Sprite(material)

        // Position above the building - get building height from geometry
        const geometry = nodeMesh.geometry as THREE.BoxGeometry
        const buildingHeight = geometry.parameters.height
        sprite.position.set(nodeMesh.position.x, nodeMesh.position.y, nodeMesh.position.z + buildingHeight)

        const node = nodeMesh.userData.nodeData as Node
        const baseScale = Math.min(node.width, node.length) * 0.7
        const scale = Math.min(this.maxNodeSize, Math.max(baseScale, this.minNodeSize))
        const aspect = canvas.width / canvas.height
        sprite.scale.set(scale * aspect, scale, 1)

        sprite.renderOrder = 9999
        return sprite
    }
}
