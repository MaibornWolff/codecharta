import {filesSelector} from "../../../state/store/files/files.selector"
import {accumulatedDataSelector} from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import {
	prepareGeometryForPrinting,
	updateMapSize,
} from "../../../services/3DExports/prepareGeometryForPrinting.service"
import {serialize3mf} from "../../../services/3DExports/serialize3mf.service"
import {FileNameHelper} from "../../../util/fileNameHelper"
import {isDeltaState} from "../../../model/files/files.helper"
import {FileDownloader} from "../../../util/fileDownloader"
import {Component, ElementRef, ViewChild, ViewEncapsulation} from "@angular/core"
import {State} from "@ngrx/store"
import {CcState} from "../../../codeCharta.model"
import {ThreeSceneService} from "../../codeMap/threeViewer/threeSceneService"
import {Box3, Color, Mesh, PerspectiveCamera, Scene, WebGLRenderer} from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {STLExporter} from "three/examples/jsm/exporters/STLExporter"

interface printer {
	x: number
	y: number
	z: number
	numberOfColors: number
}

@Component({
	selector: 'export3DMapDialog.component',
	templateUrl: "./export3DMapDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapDialogComponent {
	@ViewChild("rendererContainer") rendererContainer: ElementRef
	isPrintMeshLoaded = false

	printerOptions = ["prusaMk3s", "bambuA1", "prusaXL"]
	selectedPrinter = this.printerOptions[0]
	printers: { [key: string]: printer } = {
		prusaMk3s: {x: 200, y: 200, z: 200, numberOfColors: 1},
		bambuA1: {x: 0, y: 0, z: 200, numberOfColors: 4},
		prusaXL: {x: 245, y: 200, z: 200, numberOfColors: 5}
	}
	maxPrinterX: number

	/*
	test: should test for size
	 */
	maxPrinterY: number
	maxPrinterZ: number
	maxWidth: number
	wantedWidthInCm: number
	currentWidth: number
	depth: number
	height: number
	private printPreviewScene: Scene

	constructor(private state: State<CcState>, private threeSceneService: ThreeSceneService) {
		this.maxPrinterX = this.printers[this.selectedPrinter].x
		this.maxPrinterY = this.printers[this.selectedPrinter].y
		this.maxPrinterZ = this.printers[this.selectedPrinter].z

		//this is only an initial guess needed for calculating the actual map size
		this.currentWidth = this.maxPrinterX
		this.wantedWidthInCm = this.maxPrinterX / 10

		this.createScene()
	}

	onScaleChange() {
		const printMesh = (this.printPreviewScene as Scene).getObjectByName("PrintMesh") as Mesh
		updateMapSize(printMesh, this.currentWidth, this.wantedWidthInCm * 10)
		this.updateCurrentSize(printMesh)
	}

	async createScene() {
		//TODO: create scene differently
		const printPreviewScene = this.threeSceneService.scene.clone(true) as Scene
		printPreviewScene.background = new Color(0xec_ed_dc)
		const lights = printPreviewScene.children[3]
		const camera = new PerspectiveCamera(45, 1.15, 50, 200_000)
		//TODO: make relative to map size
		camera.position.set(-100, 250, 250)
		console.log({lights, camera})

		printPreviewScene.children = [lights, camera]
		printPreviewScene.name = "printPreviewScene"
		printPreviewScene.add(await this.initPrintMesh())
		printPreviewScene.rotateX(-Math.PI / 2)

		// Create a new renderer and set its size
		const renderer = new WebGLRenderer()

		// Append the renderer to the rendererContainer
		this.rendererContainer.nativeElement.appendChild(renderer.domElement)

		const controls = new OrbitControls(camera, renderer.domElement)

		// Create an animation loop
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

		const geometryOptions = {
			width: this.wantedWidthInCm * 10,
			frontText: "CodeCharta",
		}
		const printMesh = await prepareGeometryForPrinting(this.threeSceneService.getMapMesh().getThreeMesh(), geometryOptions)

		this.makeMapMaxSize(printMesh)

		this.isPrintMeshLoaded = true
		return printMesh
	}

	async download3MFFile() {
		//TODO: change extruder mapping
		const compressed3mf = await serialize3mf(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
		this.downloadFile(compressed3mf, "3mf")
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
		const boundingBox = new Box3();
		printMesh.traverse((child) => {
			boundingBox.expandByObject(child);
		});
		this.currentWidth = boundingBox.max.x - boundingBox.min.x
		this.depth = boundingBox.max.y - boundingBox.min.y
		this.height = boundingBox.max.z - boundingBox.min.z
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
