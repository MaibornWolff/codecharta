import { filesSelector } from "../../../state/store/files/files.selector"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import {
	addCustomLogo,
	flipCustomLogo,
	createPrintPreviewMesh,
	rotateCustomLogo,
	updateFrontText,
	updateMapSize,
	GeometryOptions
} from "../../../services/3DExports/prepareGeometryForPrinting.service"
import { FileNameHelper } from "../../../util/fileNameHelper"
import { isDeltaState } from "../../../model/files/files.helper"
import { FileDownloader } from "../../../util/fileDownloader"
import { Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Color, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { metricTitles } from "../../../util/metric/metricTitles"
import { serialize3mf } from "../../../services/3DExports/serialize3mf.service"
import { map, take } from "rxjs"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"

interface printer {
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
	private printPreviewScene: Scene

	isPrintMeshLoaded = false
	frontText = "CodeCharta"

	printerOptions = ["prusaMk3s", "bambuA1", "prusaXL"]
	selectedPrinter = this.printerOptions[0]
	printers: { [key: string]: printer } = {
		prusaMk3s: { x: 200, y: 200, z: 200, numberOfColors: 1 },
		bambuA1: { x: 0, y: 0, z: 200, numberOfColors: 4 },
		prusaXL: { x: 245, y: 200, z: 200, numberOfColors: 5 }
	}
	maxPrinterX: number
	maxPrinterY: number
	maxPrinterZ: number

	maxWidth: number
	wantedWidthInCm: number
	currentWidth: number
	depth: number
	height: number

	areaMetric: string
	heightMetric: string
	colorMetric: string
	nodeMetricData: NodeMetricData[]

	constructor(private store: Store<CcState>, private state: State<CcState>, private threeSceneService: ThreeSceneService) {}

	ngOnInit(): void {
		this.maxPrinterX = this.printers[this.selectedPrinter].x
		this.maxPrinterY = this.printers[this.selectedPrinter].y
		this.maxPrinterZ = this.printers[this.selectedPrinter].z

		//this is only an initial guess, needed for calculating the actual map size
		this.currentWidth = this.maxPrinterX
		this.wantedWidthInCm = this.maxPrinterX / 10

		this.areaMetric = this.state.getValue().dynamicSettings.areaMetric
		this.heightMetric = this.state.getValue().dynamicSettings.heightMetric
		this.colorMetric = this.state.getValue().dynamicSettings.colorMetric

		this.store
			.select(metricDataSelector)
			.pipe(map(metricData => metricData.nodeMetricData))
			.pipe(take(1))
			.subscribe(
				nodeMetricData =>
					(this.nodeMetricData = nodeMetricData.filter(
						metric => metric.name === this.areaMetric || metric.name === this.heightMetric || metric.name === this.colorMetric
					))
			)

		this.createScene()
	}

	onScaleChange() {
		const printMesh = (this.printPreviewScene as Scene).getObjectByName("PrintMesh") as Mesh
		updateMapSize(printMesh, this.currentWidth, this.wantedWidthInCm * 10)
		this.updateCurrentSize(printMesh)
	}
	onFrontTextChange() {
		const printMesh = (this.printPreviewScene as Scene).getObjectByName("PrintMesh") as Mesh
		updateFrontText(printMesh, this.frontText, this.currentWidth)
	}
	onFileSelected(event) {
		const printMesh = (this.printPreviewScene as Scene).getObjectByName("PrintMesh") as Mesh
		const file: File = event.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => {
				addCustomLogo(printMesh, reader.result as string, this.currentWidth)
			}
		}
	}
	onRotateLogo() {
		rotateCustomLogo(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
	}
	onFlipLogo() {
		flipCustomLogo(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
	}

	async createScene() {
		const printPreviewScene = new Scene()
		printPreviewScene.background = new Color(0xec_ed_dc)
		const lights = this.threeSceneService.scene.clone().children[3]
		lights.name = "lights"
		printPreviewScene.add(lights)

		printPreviewScene.name = "printPreviewScene"
		printPreviewScene.add(await this.initPrintMesh())

		const renderer = new WebGLRenderer()
		this.rendererContainer.nativeElement.appendChild(renderer.domElement)

		const camera = new PerspectiveCamera(45, 1.15, 50, 200_000)
		camera.name = "camera"
		//camera.position.set(-50, -100, 300)
		camera.position.set(0, 0, -300)
		//camera.position.set(-this.currentWidth * 0.5, -this.depth, this.height * 3)
		//camera.up = new Vector3(0, 0, 1)
		printPreviewScene.rotateZ(Math.PI * 2)
		printPreviewScene.add(camera)

		const controls = new OrbitControls(camera, renderer.domElement)

		const animate = function () {
			requestAnimationFrame(animate)
			controls.update()
			renderer.render(printPreviewScene, camera)
		}

		animate()

		this.printPreviewScene = printPreviewScene
	}
	async initPrintMesh() {
		this.isPrintMeshLoaded = false

		const geometryOptions = this.makeGeometryOptions()
		const printMesh = await createPrintPreviewMesh(this.threeSceneService.getMapMesh().getThreeMesh(), geometryOptions)

		this.makeMapMaxSize(printMesh)

		this.isPrintMeshLoaded = true
		return printMesh
	}
	private makeGeometryOptions(): GeometryOptions {
		const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
		const fallbackTitles: Map<string, string> = metricTitles

		const areaMetricTitle = attributeDescriptors[this.areaMetric]?.title || fallbackTitles.get(this.areaMetric)
		const heightMetricTitle = attributeDescriptors[this.heightMetric]?.title || fallbackTitles.get(this.heightMetric)
		const colorMetricTitle = attributeDescriptors[this.colorMetric]?.title || fallbackTitles.get(this.colorMetric)

		return {
			width: this.wantedWidthInCm * 10,
			areaMetricTitle,
			areaMetricData: this.nodeMetricData.find(metric => metric.name === this.areaMetric),
			heightMetricTitle,
			heightMetricData: this.nodeMetricData.find(metric => metric.name === this.heightMetric),
			colorMetricTitle,
			colorMetricData: this.nodeMetricData.find(metric => metric.name === this.colorMetric),
			colorRange: this.state.getValue().dynamicSettings.colorRange,
			frontText: this.frontText
		}
	}
	private makeMapMaxSize(printMesh: Mesh) {
		this.updateCurrentSize(printMesh)
		const widthRatio = this.currentWidth / this.maxPrinterX
		const depthRatio = this.depth / this.maxPrinterY
		const heightRatio = this.height / this.maxPrinterZ

		const biggestRatio = Math.max(widthRatio, depthRatio, heightRatio)
		if (biggestRatio > 1) {
			this.wantedWidthInCm = Math.floor(this.currentWidth / biggestRatio) / 10
			updateMapSize(printMesh, this.currentWidth, this.wantedWidthInCm * 10)
			this.updateCurrentSize(printMesh)
		}

		if (!this.maxWidth) {
			this.maxWidth = Math.floor(this.maxPrinterX / biggestRatio)
		}
	}

	private updateCurrentSize(printMesh: Mesh) {
		const baseplate = printMesh.getObjectByName("Baseplate") as Mesh
		baseplate.geometry.computeBoundingBox()
		const boundingBoxBaseplate = baseplate.geometry.boundingBox

		const map = printMesh.getObjectByName("Map") as Mesh
		map.geometry.computeBoundingBox()
		const boundingBoxMap = map.geometry.boundingBox

		this.currentWidth = boundingBoxBaseplate.max.x - boundingBoxBaseplate.min.x
		this.depth = boundingBoxBaseplate.max.y - boundingBoxBaseplate.min.y
		this.height = boundingBoxBaseplate.max.z - boundingBoxBaseplate.min.z + boundingBoxMap.max.z - boundingBoxMap.min.z
	}

	async download3MFFile() {
		//TODO: change extruder mapping
		const compressed3mf = await serialize3mf(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
		this.downloadFile(compressed3mf, "3mf")
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
