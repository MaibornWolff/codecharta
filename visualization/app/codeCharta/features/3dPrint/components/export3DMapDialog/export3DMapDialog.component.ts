import { filesSelector } from "../../../../state/store/files/files.selector"
import { accumulatedDataSelector } from "../../../../state/selectors/accumulatedData/accumulatedData.selector"
import { FileNameHelper } from "../../../../util/fileNameHelper"
import { getVisibleFileStates, isDeltaState } from "../../../../model/files/files.helper"
import { FileDownloader } from "../../../../util/fileDownloader"
import { AfterViewInit, Component, ElementRef, output, signal, viewChild } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../../codeCharta.model"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, Vector3, WebGLRenderer } from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { STLExporter } from "three/addons/exporters/STLExporter.js"
import { metricTitles } from "../../../../util/metric/metricTitles"
import { serialize3mf } from "../../../../services/3DExports/serialize3mf.service"
import {
    calculateMaxPossibleWidthForPreview3DPrintMesh,
    GeometryOptions,
    Preview3DPrintMesh
} from "../../../../services/3DExports/3DPreview/preview3DPrintMesh"
import { calculateNodeMetricData } from "../../../../state/selectors/accumulatedData/metricData/nodeMetricData.calculator"
import { PrinterPresetSelectionComponent, Printer, PRINTER_PRESETS } from "./printerPresetSelection/printerPresetSelection.component"
import { ScaleSliderComponent } from "./scaleSlider/scaleSlider.component"
import { FrontTextInputComponent } from "./frontTextInput/frontTextInput.component"
import { SecondRowTextInputComponent } from "./secondRowTextInput/secondRowTextInput.component"
import { QrCodeSettingsComponent } from "./qrCodeSettings/qrCodeSettings.component"
import { LogoUploadComponent } from "./logoUpload/logoUpload.component"
import { ExportActionsComponent } from "./exportActions/exportActions.component"

@Component({
    selector: "cc-export-3D-map-dialog",
    templateUrl: "./export3DMapDialog.component.html",
    imports: [
        PrinterPresetSelectionComponent,
        ScaleSliderComponent,
        FrontTextInputComponent,
        SecondRowTextInputComponent,
        QrCodeSettingsComponent,
        LogoUploadComponent,
        ExportActionsComponent
    ]
})
export class Export3DMapDialogComponent implements AfterViewInit {
    dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")
    rendererContainer = viewChild.required<ElementRef<HTMLDivElement>>("rendererContainer")
    closed = output<void>()

    private printPreviewScene: Scene
    currentSize = signal(new Vector3())

    isPrintMeshLoaded = signal(false)
    frontText = signal("")
    logoColor = signal("#ffffff")
    isFileSelected = signal(false)

    secondRowVisible = signal(false)
    secondRowText = signal(new Date().toLocaleDateString())

    qrCodeVisible = signal(false)
    qrCodeText = signal("maibornwolff.de/service/it-sanierung")

    selectedPrinter = signal<Printer>(PRINTER_PRESETS[2])
    private currentNumberOfColors: number

    maxWidth = signal(0)
    wantedWidth = signal(0)
    private previewMesh: Preview3DPrintMesh

    private readonly areaMetric: string
    private readonly heightMetric: string
    private readonly colorMetric: string
    private readonly nodeMetricData: NodeMetricData[]

    private readonly layerHeight = 0.2
    private readonly frontTextSize = 8
    private readonly secondRowTextSize = 6
    private readonly frontPrintDepth = 0.6
    private readonly mapSideOffset = 10
    private readonly baseplateHeight = 1
    private readonly logoSize = 10

    constructor(
        private readonly state: State<CcState>,
        private readonly threeSceneService: ThreeSceneService
    ) {
        const initialMaxWidth = calculateMaxPossibleWidthForPreview3DPrintMesh(
            new Vector3(this.selectedPrinter().x, this.selectedPrinter().y, this.selectedPrinter().z),
            this.threeSceneService.getMapMesh().getThreeMesh(),
            this.frontTextSize,
            this.baseplateHeight,
            this.mapSideOffset
        )
        this.maxWidth.set(initialMaxWidth)
        this.wantedWidth.set(initialMaxWidth)
        this.currentSize.update(size => {
            size.x = initialMaxWidth
            return size
        })
        this.currentNumberOfColors = this.selectedPrinter().numberOfColors

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
        const dialogElement = this.dialog().nativeElement
        dialogElement.addEventListener("close", () => this.closed.emit())
        dialogElement.showModal()
        await this.createScene()
        this.isPrintMeshLoaded.set(true)
    }

    close() {
        this.dialog().nativeElement.close()
    }

    handleScaleChange(width: number) {
        this.wantedWidth.set(width)
        this.previewMesh.updateSize(width).then((qrCodeVisible: boolean) => {
            this.qrCodeVisible.set(qrCodeVisible)
        })
        this.currentSize.set(this.previewMesh.getSize())
    }

    handleFrontTextChange(text: string) {
        this.frontText.set(text)
        this.previewMesh.updateFrontText(text)
    }

    handleFileSelected(file: File) {
        this.isFileSelected.set(true)
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            this.previewMesh.addCustomLogo(reader.result as string)
        }
    }

    handleRotateLogo() {
        this.previewMesh.rotateCustomLogo()
    }

    handleFlipLogo() {
        this.previewMesh.flipCustomLogo()
    }

    handleRemoveLogo() {
        this.isFileSelected.set(false)
        this.previewMesh.removeCustomLogo()
    }

    handlePrinterChange(printer: Printer) {
        this.selectedPrinter.set(printer)
        const wantedNumberOfColors = printer.numberOfColors
        if (this.currentNumberOfColors !== wantedNumberOfColors) {
            this.previewMesh.updateNumberOfColors(wantedNumberOfColors)
            this.currentNumberOfColors = wantedNumberOfColors
        }
        this.makeMapMaxSize()
        this.updateCameraPosition(this.printPreviewScene.getObjectByName("camera") as PerspectiveCamera)
    }

    handleLogoColorChange(color: string) {
        this.logoColor.set(color)
        this.previewMesh.updateCustomLogoColor(color)
    }

    handleQrCodeTextChange(text: string) {
        this.qrCodeText.set(text)
        this.previewMesh.updateQrCodeText(text)
        this.previewMesh.updateQrCodeVisibility(this.qrCodeVisible())
    }

    handleQrCodeVisibilityChange(visible: boolean) {
        this.qrCodeVisible.set(visible)
        this.previewMesh.updateQrCodeVisibility(visible)
    }

    handleSecondRowTextChange(text: string) {
        this.secondRowText.set(text)
        this.previewMesh.updateSecondRowText(text)
        this.previewMesh.updateSecondRowVisibility(this.secondRowVisible())
    }

    handleSecondRowVisibilityChange(visible: boolean) {
        this.secondRowVisible.set(visible)
        this.previewMesh.updateSecondRowVisibility(visible)
    }

    async createScene() {
        const printPreviewScene = new Scene()
        printPreviewScene.name = "printPreviewScene"
        this.printPreviewScene = printPreviewScene

        printPreviewScene.background = new Color(0xec_ed_dc)
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
        this.currentSize.set(this.previewMesh.getSize())
        printPreviewScene.add(this.previewMesh.getThreeMesh())

        this.updateCameraPosition(camera)
    }

    private initRenderer(printPreviewScene: Scene, camera: PerspectiveCamera) {
        const renderer = this.getGL()
        const container = this.rendererContainer().nativeElement
        const containerWidth = container.offsetWidth || 600
        const containerHeight = container.offsetHeight || 450
        renderer.setSize(containerWidth, containerHeight, true)
        container.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)

        const animate = function () {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(printPreviewScene, camera)
        }

        animate()
    }

    getGL() {
        return new WebGLRenderer()
    }

    private updateCameraPosition(camera: PerspectiveCamera) {
        const size = this.currentSize()
        camera.position.set(-size.x * 0.2, -size.y * 1.2, size.z * 3)
    }

    async handleDownload3MF() {
        const compressed3mf = await serialize3mf(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
        this.downloadFile(compressed3mf, "3mf")
    }

    private makeMapMaxSize() {
        const newMaxWidth = calculateMaxPossibleWidthForPreview3DPrintMesh(
            new Vector3(this.selectedPrinter().x, this.selectedPrinter().y, this.selectedPrinter().z),
            this.threeSceneService.getMapMesh().getThreeMesh(),
            this.frontTextSize,
            this.baseplateHeight,
            this.mapSideOffset
        )
        this.wantedWidth.set(newMaxWidth)
        this.previewMesh.updateSize(newMaxWidth).then((qrCodeVisible: boolean) => {
            this.qrCodeVisible.set(qrCodeVisible)
        })
        this.currentSize.set(this.previewMesh.getSize())
        this.maxWidth.set(this.currentSize().x)
    }

    handleDownloadSTL() {
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
            width: this.wantedWidth(),
            areaMetricTitle,
            areaMetricData: this.nodeMetricData.find(metric => metric.name === this.areaMetric),
            heightMetricTitle,
            heightMetricData: this.nodeMetricData.find(metric => metric.name === this.heightMetric),
            colorMetricTitle,
            colorMetricData: this.nodeMetricData.find(metric => metric.name === this.colorMetric),
            colorRange: this.state.getValue().dynamicSettings.colorRange,
            frontText: this.frontText(),
            secondRowText: this.secondRowText(),
            secondRowVisible: this.secondRowVisible(),
            qrCodeText: this.qrCodeText(),
            defaultMaterial: this.threeSceneService.getMapMesh().getThreeMesh().material[0].clone() as ShaderMaterial,
            numberOfColors: this.currentNumberOfColors,
            layerHeight: this.layerHeight,
            frontTextSize: this.frontTextSize,
            secondRowTextSize: this.secondRowTextSize,
            printHeight: this.frontPrintDepth,
            mapSideOffset: this.mapSideOffset,
            baseplateHeight: this.baseplateHeight,
            logoSize: this.logoSize
        }
    }

    private downloadFile(data: string, fileExtension: string) {
        const files = filesSelector(this.state.getValue())
        const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
        const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.${fileExtension}`
        FileDownloader.downloadData(data, downloadFileName)
    }
}
