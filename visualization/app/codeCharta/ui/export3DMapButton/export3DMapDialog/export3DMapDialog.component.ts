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
import { serialize3mf } from "../../../services/3DExports/serialize3mf.service"
import { FileNameHelper } from "../../../util/fileNameHelper"
import { isDeltaState } from "../../../model/files/files.helper"
import { FileDownloader } from "../../../util/fileDownloader"
import { Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Box3, Color, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { take } from "rxjs"
import { metricTitles } from "../../../util/metric/metricTitles"

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

	constructor(private state: State<CcState>, private threeSceneService: ThreeSceneService) {
		this.maxPrinterX = this.printers[this.selectedPrinter].x
		this.maxPrinterY = this.printers[this.selectedPrinter].y
		this.maxPrinterZ = this.printers[this.selectedPrinter].z

		//this is only an initial guess, needed for calculating the actual map size
		this.currentWidth = this.maxPrinterX
		this.wantedWidthInCm = this.maxPrinterX / 10

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
		camera.position.set(-this.currentWidth * 0.5, -this.depth, this.height * 3)
		camera.up = new Vector3(0, 0, 1)
		printPreviewScene.add(camera)

		const controls = new OrbitControls(camera, renderer.domElement)

		const animate = function () {
			requestAnimationFrame(animate)
			controls.update()
			renderer.render(printPreviewScene, camera)
		}

		animate()

		this.printPreviewScene = printPreviewScene
		console.log(printPreviewScene)
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
		const areaMetric: string = this.state.getValue().dynamicSettings.areaMetric
		const heightMetric: string = this.state.getValue().dynamicSettings.heightMetric
		const colorMetric: string = this.state.getValue().dynamicSettings.colorMetric

		const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
		const fallbackTitles: Map<string, string> = metricTitles

		let areaMetricName = attributeDescriptors[areaMetric]?.title || fallbackTitles.get(areaMetric)
		let heightMetricName = attributeDescriptors[heightMetric]?.title || fallbackTitles.get(heightMetric)
		let colorMetricName = attributeDescriptors[colorMetric]?.title || fallbackTitles.get(colorMetric)

		areaMetricName += `\n(${areaMetric}):`
		heightMetricName += `\n(${heightMetric}):`
		colorMetricName += `\n(${colorMetric}):`

		return {
			width: this.wantedWidthInCm * 10,
			areaMetricName,
			heightMetricName,
			colorMetricName,
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
		const boundingBox = new Box3()
		for (const child of printMesh.children) {
			if (child.visible) {
				boundingBox.expandByObject(child)
			}
		}
		this.currentWidth = boundingBox.max.x - boundingBox.min.x
		this.depth = boundingBox.max.y - boundingBox.min.y
		this.height = boundingBox.max.z - boundingBox.min.z
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
