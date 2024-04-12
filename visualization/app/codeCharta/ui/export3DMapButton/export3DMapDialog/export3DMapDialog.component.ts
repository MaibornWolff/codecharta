import { filesSelector } from "../../../state/store/files/files.selector"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { FileNameHelper } from "../../../util/fileNameHelper"
import { getVisibleFileStates, isDeltaState } from "../../../model/files/files.helper"
import { FileDownloader } from "../../../util/fileDownloader"
import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, Vector3, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { metricTitles } from "../../../util/metric/metricTitles"
import { serialize3mf } from "../../../services/3DExports/serialize3mf.service"
import {
	calculateMaxPossibleWidthForPreview3DPrintMesh,
	GeometryOptions,
	Preview3DPrintMesh
} from "../../../services/3DExports/preview3DPrintMesh"
import { calculateNodeMetricData } from "../../../state/selectors/accumulatedData/metricData/nodeMetricData.calculator"

interface Printer {
	name: string
	x: number
	y: number
	z: number
	numberOfColors: number
}

@Component({
	selector: "export3DMapDialog.component",
	templateUrl: "./export3DMapDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapDialogComponent {
	@ViewChild("rendererContainer") rendererContainer: ElementRef
	@Input() logoColor = "#ffffff"

	private printPreviewScene: Scene
	currentSize: Vector3

	isFileSelected = false
	isPrintMeshLoaded = false
	frontText = "CodeCharta"

	printers: Printer[] = [
		{ name: "Prusa MK3S", x: 245, y: 205, z: 205, numberOfColors: 1 },
		{ name: "Bambu A1", x: 251, y: 251, z: 251, numberOfColors: 4 },
		{ name: "Prusa XL", x: 355, y: 355, z: 355, numberOfColors: 5 }
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

	constructor(private state: State<CcState>, private threeSceneService: ThreeSceneService) {
		//console.log(this.threeSceneService)
		this.maxWidth = calculateMaxPossibleWidthForPreview3DPrintMesh(
			new Vector3(this.selectedPrinter.x, this.selectedPrinter.y, this.selectedPrinter.z),
			this.threeSceneService.getMapMesh().getThreeMesh()
		)
		this.currentSize = new Vector3()
		this.currentSize.x = this.maxWidth
		this.wantedWidth = this.maxWidth
		this.currentNumberOfColors = this.selectedPrinter.numberOfColors
		this.isPrintMeshLoaded = false

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

	ngAfterViewInit() {
		this.createScene().then(() => (this.isPrintMeshLoaded = true))
	}

	onScaleChange() {
		this.previewMesh.updateMapSize(this.wantedWidth)
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
	onSelectedPrinterChange() {
		const wantedNumberOfColors = this.selectedPrinter.numberOfColors
		if (this.currentNumberOfColors !== wantedNumberOfColors) {
			const originalMesh = this.threeSceneService.getMapMesh().getThreeMesh()
			this.previewMesh.updateNumberOfColors(originalMesh, wantedNumberOfColors)
			this.currentNumberOfColors = wantedNumberOfColors
		}
		this.makeMapMaxSize()
		this.updateCameraPosition(this.printPreviewScene.getObjectByName("camera") as PerspectiveCamera)
	}
	onLogoColorChange(newColor: string) {
		this.logoColor = newColor
		this.previewMesh.updateCustomLogoColor(this.logoColor)
	}

	async createScene() {
		const printPreviewScene = new Scene()
		printPreviewScene.name = "printPreviewScene"
		this.printPreviewScene = printPreviewScene

		printPreviewScene.background = new Color(0xec_ed_dc) //TODO: can I somehow get the current background color from the store or something?
		const lights = this.threeSceneService.scene.clone().children[3]
		lights.name = "lights"
		printPreviewScene.add(lights)

		const renderer = new WebGLRenderer()
		this.rendererContainer.nativeElement.appendChild(renderer.domElement)

		const camera = new PerspectiveCamera(45, 1.15, 50, 200_000)
		camera.name = "camera"
		camera.up = new Vector3(0, 0, 1)
		printPreviewScene.add(camera)

		const controls = new OrbitControls(camera, renderer.domElement)

		const animate = function () {
			requestAnimationFrame(animate)
			controls.update()
			renderer.render(printPreviewScene, camera)
		}

		animate()

		this.previewMesh = new Preview3DPrintMesh()
		await this.previewMesh.initialize(this.initGeometryOptions())
		this.currentSize = this.previewMesh.getSize()
		printPreviewScene.add(this.previewMesh.getThreeMesh())

		//camera.position.set(0, 0, -this.wantedWidth*1.5) //To directly see the backside of the map: uncomment this line and comment the next line
		this.updateCameraPosition(camera)
	}

	private updateCameraPosition(camera: PerspectiveCamera) {
		camera.position.set(-this.currentSize.x * 0.2, -this.currentSize.y * 1.2, this.currentSize.z * 5)
	}

	async download3MFFile() {
		const compressed3mf = await serialize3mf(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
		this.downloadFile(compressed3mf, "3mf")
	}

	private makeMapMaxSize() {
		this.wantedWidth = calculateMaxPossibleWidthForPreview3DPrintMesh(
			new Vector3(this.selectedPrinter.x, this.selectedPrinter.y, this.selectedPrinter.z),
			this.threeSceneService.getMapMesh().getThreeMesh()
		)
		this.previewMesh.updateMapSize(this.wantedWidth)
		this.currentSize = this.previewMesh.getSize()
		this.maxWidth = this.currentSize.x
	}

	private initGeometryOptions(): GeometryOptions {
		const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
		const fallbackTitles: Map<string, string> = metricTitles

		const areaMetricTitle = attributeDescriptors[this.areaMetric]?.title || fallbackTitles.get(this.areaMetric)
		const heightMetricTitle = attributeDescriptors[this.heightMetric]?.title || fallbackTitles.get(this.heightMetric)
		const colorMetricTitle = attributeDescriptors[this.colorMetric]?.title || fallbackTitles.get(this.colorMetric)

		return {
			originalMapMesh: this.threeSceneService.getMapMesh().getThreeMesh(),
			wantedWidth: this.wantedWidth,
			areaMetricTitle,
			areaMetricData: this.nodeMetricData.find(metric => metric.name === this.areaMetric),
			heightMetricTitle,
			heightMetricData: this.nodeMetricData.find(metric => metric.name === this.heightMetric),
			colorMetricTitle,
			colorMetricData: this.nodeMetricData.find(metric => metric.name === this.colorMetric),
			colorRange: this.state.getValue().dynamicSettings.colorRange,
			frontText: this.frontText,
			defaultMaterial: this.threeSceneService.getMapMesh().getThreeMesh().material[0].clone() as ShaderMaterial,
			numberOfColors: this.currentNumberOfColors
		}
	}

	downloadStlFile() {
		const exportedBinaryFile = new STLExporter().parse(this.threeSceneService.getMapMesh().getThreeMesh(), {
			binary: true
		}) as unknown as string
		this.downloadFile(exportedBinaryFile, "stl")
	}

	private downloadFile(data: string, fileExtension: string) {
		const files = filesSelector(this.state.getValue())
		const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
		const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.${fileExtension}`
		FileDownloader.downloadData(data, downloadFileName)
	}
}
