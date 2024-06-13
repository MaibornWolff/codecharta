import { filesSelector } from "../../../state/store/files/files.selector"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { FileNameHelper } from "../../../util/fileNameHelper"
import { getVisibleFileStates, isDeltaState } from "../../../model/files/files.helper"
import { FileDownloader } from "../../../util/fileDownloader"
import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { metricTitles } from "../../../util/metric/metricTitles"
import { serialize3mf } from "../../../services/3DExports/serialize3mf.service"
import {
    calculateMaxPossibleWidthForPreview3DPrintMesh,
    GeometryOptions,
    Preview3DPrintMesh
} from "../../../services/3DExports/3DPreview/preview3DPrintMesh"
import { calculateNodeMetricData } from "../../../state/selectors/accumulatedData/metricData/nodeMetricData.calculator"
import { MatSlideToggleChange } from "@angular/material/slide-toggle"

interface Printer {
    name: string
    x: number
    y: number
    z: number
    numberOfColors: number
}

interface ManualVisibilityItem {
    readonly defaultText: string
    readonly name: string
    isVisible: boolean
    currentText?: string
}

@Component({
    selector: "export3DMapDialog.component",
    templateUrl: "./export3DMapDialog.component.html",
    styleUrls: ["./export3DMapDialog.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class Export3DMapDialogComponent {
    @ViewChild("rendererContainer") rendererContainer: ElementRef
    @ViewChild("fileInput") fileInput: ElementRef
    @Input() logoColor = "#ffffff"

    private printPreviewScene: Scene
    currentSize: Vector3

    isFileSelected = false
    isPrintMeshLoaded = false
    frontText: string

    secondRow = {
        defaultText: new Date().toLocaleDateString(),
        name: "Second Row Text",
        isVisible: false,
        currentText: undefined
    }
    qrCode: ManualVisibilityItem = {
        defaultText: "maibornwolff.de/service/it-sanierung",
        name: "QrCode",
        isVisible: false,
        currentText: undefined
    }

    printers: Printer[] = [
        { name: "Prusa MK3S (single color)", x: 245, y: 205, z: 205, numberOfColors: 1 },
        { name: "BambuLab A1 + AMS Lite", x: 251, y: 251, z: 251, numberOfColors: 4 },
        { name: "Prusa XL (5 colors)", x: 355, y: 335, z: 355, numberOfColors: 5 }
    ]
    selectedPrinter: Printer = this.printers[2]
    private currentNumberOfColors: number

    maxWidth: number
    wantedWidth: number
    private previewMesh: Preview3DPrintMesh

    private readonly areaMetric: string
    private readonly heightMetric: string
    private readonly colorMetric: string
    private nodeMetricData: NodeMetricData[]

    private readonly layerHeight = 0.2
    private readonly frontTextSize = 8
    private readonly secondRowTextSize = 6
    private readonly frontPrintDepth = 0.6
    private readonly mapSideOffset = 10
    private readonly baseplateHeight = 1 //should be a multiple of layerHeight
    private readonly logoSize = 10
    private readonly backTextSize = 6

    constructor(
        private state: State<CcState>,
        private threeSceneService: ThreeSceneService
    ) {
        //console.log(this.threeSceneService)
        this.maxWidth = calculateMaxPossibleWidthForPreview3DPrintMesh(
            new Vector3(this.selectedPrinter.x, this.selectedPrinter.y, this.selectedPrinter.z),
            this.threeSceneService.getMapMesh().getThreeMesh(),
            this.frontTextSize,
            this.baseplateHeight,
            this.mapSideOffset
        )
        this.currentSize = new Vector3()
        this.currentSize.x = this.maxWidth
        this.wantedWidth = this.maxWidth
        this.currentNumberOfColors = this.selectedPrinter.numberOfColors
        this.isPrintMeshLoaded = false

        this.secondRow.currentText = this.secondRow.defaultText
        this.qrCode.currentText = this.qrCode.defaultText

        this.areaMetric = this.state.getValue().dynamicSettings.areaMetric
        this.heightMetric = this.state.getValue().dynamicSettings.heightMetric
        this.colorMetric = this.state.getValue().dynamicSettings.colorMetric

        const visibleFileStates = getVisibleFileStates(this.state.getValue().files)
        const blacklist = this.state.getValue().fileSettings.blacklist
        const nodeMetricData = calculateNodeMetricData(visibleFileStates, blacklist)
        this.nodeMetricData = nodeMetricData.filter(
            metric => metric.name === this.areaMetric || metric.name === this.heightMetric || metric.name === this.colorMetric
        )
    }

    async ngAfterViewInit() {
        await this.createScene()
        this.isPrintMeshLoaded = true
    }

    onScaleChange() {
        this.previewMesh.updateSize(this.wantedWidth).then((qrCodeVisible: boolean) => {
            this.qrCode.isVisible = qrCodeVisible
        })
        this.currentSize = this.previewMesh.getSize()
    }

    onFrontTextChange() {
        this.previewMesh.updateFrontText(this.frontText)
    }

    onFileSelected(event) {
        const file: File = event.target.files[0]
        if (file) {
            this.isFileSelected = true // Set isFileSelected to true when a file is selected
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                this.previewMesh.addCustomLogo(reader.result as string)
            }
        } else {
            this.isFileSelected = false
        }
    }
    onRotateLogo() {
        this.previewMesh.rotateCustomLogo()
    }

    onFlipLogo() {
        this.previewMesh.flipCustomLogo()
    }

    onRemoveLogo() {
        this.isFileSelected = false
        this.fileInput.nativeElement.value = ""
        this.previewMesh.removeCustomLogo()
    }

    onSelectedPrinterChange() {
        const wantedNumberOfColors = this.selectedPrinter.numberOfColors
        if (this.currentNumberOfColors !== wantedNumberOfColors) {
            this.previewMesh.updateNumberOfColors(wantedNumberOfColors)
            this.currentNumberOfColors = wantedNumberOfColors
        }
        this.makeMapMaxSize()
        this.updateCameraPosition(this.printPreviewScene.getObjectByName("camera") as PerspectiveCamera)
    }

    onLogoColorChange(newColor: string) {
        this.logoColor = newColor
        this.previewMesh.updateCustomLogoColor(this.logoColor)
    }

    onQrCodeTextChange() {
        this.onTextChange(this.qrCode)
        this.previewMesh.updateQrCodeText(this.qrCode.currentText)
        this.previewMesh.updateQrCodeVisibility(this.qrCode.isVisible)
    }
    onQrCodeVisibilityChange(event: MatSlideToggleChange) {
        if (this.qrCode.isVisible !== event.checked) {
            this.qrCode.isVisible = event.checked
            this.previewMesh.updateQrCodeVisibility(this.qrCode.isVisible)
        }
    }

    onSecondRowTextChange() {
        this.onTextChange(this.secondRow)
        this.previewMesh.updateSecondRowText(this.secondRow.currentText)
        this.previewMesh.updateSecondRowVisibility(this.secondRow.isVisible)
    }
    onSecondRowVisibilityChange(event: MatSlideToggleChange) {
        if (this.secondRow.isVisible !== event.checked) {
            this.secondRow.isVisible = event.checked
            this.previewMesh.updateSecondRowVisibility(this.secondRow.isVisible)
        }
    }

    private onTextChange(item: ManualVisibilityItem) {
        if (item.currentText === "") {
            item.isVisible = false
            return
        }
        if (!item.isVisible) {
            item.isVisible = true
        }
    }

    async createScene() {
        const printPreviewScene = new Scene()
        printPreviewScene.name = "printPreviewScene"
        this.printPreviewScene = printPreviewScene

        printPreviewScene.background = new Color(0xec_ed_dc) //TODO: can I somehow get the current background color from the store or something?
        const lights = this.threeSceneService.scene.clone().children[3]
        lights.name = "lights"
        printPreviewScene.add(lights)

        const camera = new PerspectiveCamera(45, 1.15, 50, 200_000)
        camera.name = "camera"
        camera.up = new Vector3(0, 0, 1)
        printPreviewScene.add(camera)

        this.initRenderer(printPreviewScene, camera)

        this.previewMesh = new Preview3DPrintMesh(this.initGeometryOptions())
        await this.previewMesh.initialize()
        this.currentSize = this.previewMesh.getSize()
        printPreviewScene.add(this.previewMesh.getThreeMesh())

        //camera.position.set(0, 0, -this.width * 1.5) //To directly see the backside of the map: uncomment this line and comment the next line
        this.updateCameraPosition(camera)
    }

    private initRenderer(printPreviewScene, camera) {
        const renderer = new WebGLRenderer()
        const currentSize = new Vector2()
        renderer.getSize(currentSize)
        const containerWidth = this.rendererContainer.nativeElement.offsetWidth
        const containerHeight = currentSize.y * (containerWidth / currentSize.x)
        renderer.setSize(containerWidth, containerHeight, true)
        this.rendererContainer.nativeElement.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)

        const animate = function () {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(printPreviewScene, camera)
        }

        animate()
    }

    private updateCameraPosition(camera: PerspectiveCamera) {
        camera.position.set(-this.currentSize.x * 0.2, -this.currentSize.y * 1.2, this.currentSize.z * 3)
    }

    async download3MFFile() {
        const compressed3mf = await serialize3mf(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
        this.downloadFile(compressed3mf, "3mf")
    }

    private makeMapMaxSize() {
        this.wantedWidth = calculateMaxPossibleWidthForPreview3DPrintMesh(
            new Vector3(this.selectedPrinter.x, this.selectedPrinter.y, this.selectedPrinter.z),
            this.threeSceneService.getMapMesh().getThreeMesh(),
            this.frontTextSize,
            this.baseplateHeight,
            this.mapSideOffset
        )
        this.previewMesh.updateSize(this.wantedWidth).then((qrCodeVisible: boolean) => {
            this.qrCode.isVisible = qrCodeVisible
        })
        this.currentSize = this.previewMesh.getSize()
        this.maxWidth = this.currentSize.x
    }

    downloadStlFile() {
        const exportedBinaryFile = new STLExporter().parse(this.previewMesh.getMapMesh(), {
            binary: true
        }) as unknown as string
        this.downloadFile(exportedBinaryFile, "stl")
    }

    private initGeometryOptions(): GeometryOptions {
        const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
        const fallbackTitles: Map<string, string> = metricTitles

        const areaMetricTitle = attributeDescriptors[this.areaMetric]?.title || fallbackTitles.get(this.areaMetric)
        const heightMetricTitle = attributeDescriptors[this.heightMetric]?.title || fallbackTitles.get(this.heightMetric)
        const colorMetricTitle = attributeDescriptors[this.colorMetric]?.title || fallbackTitles.get(this.colorMetric)

        return {
            originalMapMesh: this.threeSceneService.getMapMesh().getThreeMesh(),
            width: this.wantedWidth,
            areaMetricTitle,
            areaMetricData: this.nodeMetricData.find(metric => metric.name === this.areaMetric),
            heightMetricTitle,
            heightMetricData: this.nodeMetricData.find(metric => metric.name === this.heightMetric),
            colorMetricTitle,
            colorMetricData: this.nodeMetricData.find(metric => metric.name === this.colorMetric),
            colorRange: this.state.getValue().dynamicSettings.colorRange,
            frontText: this.frontText,
            secondRowText: this.secondRow.currentText,
            secondRowVisible: this.secondRow.isVisible,
            qrCodeText: this.qrCode.currentText,
            defaultMaterial: this.threeSceneService.getMapMesh().getThreeMesh().material[0].clone() as ShaderMaterial,
            numberOfColors: this.currentNumberOfColors,
            layerHeight: this.layerHeight,
            frontTextSize: this.frontTextSize,
            secondRowTextSize: this.secondRowTextSize,
            printHeight: this.frontPrintDepth,
            mapSideOffset: this.mapSideOffset,
            baseplateHeight: this.baseplateHeight,
            logoSize: this.logoSize,
            backTextSize: this.backTextSize
        }
    }

    private downloadFile(data: string, fileExtension: string) {
        const files = filesSelector(this.state.getValue())
        const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
        const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.${fileExtension}`
        FileDownloader.downloadData(data, downloadFileName)
    }
}
