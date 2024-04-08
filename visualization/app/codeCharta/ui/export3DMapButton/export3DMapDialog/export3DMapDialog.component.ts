import {filesSelector} from "../../../state/store/files/files.selector"
import {accumulatedDataSelector} from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import {FileNameHelper} from "../../../util/fileNameHelper"
import {isDeltaState} from "../../../model/files/files.helper"
import {FileDownloader} from "../../../util/fileDownloader"
import {Component, ElementRef, Input, ViewChild, ViewEncapsulation} from "@angular/core"
import {State, Store} from "@ngrx/store"
import {CcState, NodeMetricData} from "../../../codeCharta.model"
import {ThreeSceneService} from "../../codeMap/threeViewer/threeSceneService"
import {Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, Vector3, WebGLRenderer} from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {STLExporter} from "three/examples/jsm/exporters/STLExporter"
import {metricTitles} from "../../../util/metric/metricTitles"
import {serialize3mf} from "../../../services/3DExports/serialize3mf.service"
import {firstValueFrom, map} from "rxjs"
import {metricDataSelector} from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import {GeometryOptions, preview3DPrintMeshBuilder} from "../../../services/3DExports/preview3DPrintMeshBuilder"

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
	@Input() logoColor: string = '#ffffff'

	private printPreviewScene: Scene
	private previewMeshBuilder: preview3DPrintMeshBuilder

	isFileSelected: boolean = false;
	isPrintMeshLoaded = false
	frontText = "CodeCharta"

	printerOptions = ["prusaMk3s", "bambuA1", "prusaXL"]
	printers: { [key: string]: printer } = {
		prusaMk3s: {x: 245, y: 205, z: 205, numberOfColors: 1},
		bambuA1: {x: 251, y: 251, z: 251, numberOfColors: 4},
		prusaXL: {x: 355, y: 355, z: 355, numberOfColors: 5}
	}
	selectedPrinter = this.printerOptions[2]
	private currentNumberOfColors: number

	maxWidth: number
	wantedWidth: number
	currentWidth: number
	currentDepth: number
	currentHeight: number

	areaMetric: string
	heightMetric: string
	colorMetric: string
	nodeMetricData: NodeMetricData[]

	constructor(private store: Store<CcState>, private state: State<CcState>, private threeSceneService: ThreeSceneService) {
		this.previewMeshBuilder = new preview3DPrintMeshBuilder()

		this.maxWidth = this.previewMeshBuilder.calculateMaxWidth(new Vector3(this.printers[this.selectedPrinter].x, this.printers[this.selectedPrinter].y, this.printers[this.selectedPrinter].z), this.threeSceneService.getMapMesh().getThreeMesh())
		this.currentWidth = this.maxWidth
		this.wantedWidth = this.maxWidth
		this.currentNumberOfColors = this.printers[this.selectedPrinter].numberOfColors
	}

	async ngOnInit(): Promise<void> {
		this.areaMetric = this.state.getValue().dynamicSettings.areaMetric
		this.heightMetric = this.state.getValue().dynamicSettings.heightMetric
		this.colorMetric = this.state.getValue().dynamicSettings.colorMetric

		this.nodeMetricData = await firstValueFrom(
			this.store
				.select(metricDataSelector)
				.pipe(map(metricData => metricData.nodeMetricData))
		)

		this.nodeMetricData = this.nodeMetricData.filter(
			metric => metric.name === this.areaMetric || metric.name === this.heightMetric || metric.name === this.colorMetric
		);

		const geometryOptions = this.initGeometryOptions()
		const initMeshBuilder = this.previewMeshBuilder.initialize(geometryOptions)

		await initMeshBuilder
		await this.createScene()
	}

	onScaleChange() {
		const printMesh = (this.printPreviewScene as Scene).getObjectByName("PrintMesh") as Mesh
		this.previewMeshBuilder.updateMapSize(printMesh, this.currentWidth, this.wantedWidth)
		this.calculateCurrentSize(printMesh)
	}
	onFrontTextChange() {
		const printMesh = (this.printPreviewScene as Scene).getObjectByName("PrintMesh") as Mesh
		this.previewMeshBuilder.updateFrontText(printMesh, this.frontText)
	}
	onFileSelected(event) {
		const printMesh = this.printPreviewScene.getObjectByName("PrintMesh") as Mesh;
		const file: File = event.target.files[0];
		if (file) {
			this.isFileSelected = true; // Set isFileSelected to true when a file is selected
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.previewMeshBuilder.addCustomLogo(printMesh, reader.result as string);
			};
		} else {
			this.isFileSelected = false; // Set isFileSelected to false when no file is selected
		}
	}

	onRotateLogo() {
		this.previewMeshBuilder.rotateCustomLogo(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
	}

	onFlipLogo() {
		this.previewMeshBuilder.flipCustomLogo(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
	}

	onSelectedPrinterChange() {
		const wantedNumberOfColors = this.printers[this.selectedPrinter].numberOfColors
		if (this.currentNumberOfColors !== wantedNumberOfColors) {
			const printMesh = this.printPreviewScene.getObjectByName("PrintMesh") as Mesh
			const originalMesh = this.threeSceneService.getMapMesh().getThreeMesh()
			this.previewMeshBuilder.updateNumberOfColors(originalMesh, printMesh, wantedNumberOfColors)
			this.currentNumberOfColors = wantedNumberOfColors
		}
		this.makeMapMaxSize(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
		this.updateCameraPosition(this.printPreviewScene.getObjectByName("camera") as PerspectiveCamera)
	}
	onLogoColorChange(newColor: string) {
		this.logoColor = newColor;
		const printMesh = this.printPreviewScene.getObjectByName("PrintMesh") as Mesh;
		this.previewMeshBuilder.updateCustomLogoColor(printMesh, this.logoColor);
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
		//camera.position.set(0, 0, -300) //To directly see the backside of the map: uncomment this line and comment the next two lines
		this.updateCameraPosition(camera)
		camera.up = new Vector3(0, 0, 1)
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

	private updateCameraPosition(camera: PerspectiveCamera) {
		camera.position.set(-this.currentWidth * 0.2, -this.currentDepth * 1.2, this.currentHeight * 5)
	}

	async initPrintMesh() {
		this.isPrintMeshLoaded = false

		const printMesh = await this.previewMeshBuilder.createPrintPreviewMesh(
			this.threeSceneService.getMapMesh().getThreeMesh()
		)

		this.calculateCurrentSize(printMesh)

		this.isPrintMeshLoaded = true
		return printMesh
	}

	async download3MFFile() {
		const compressed3mf = await serialize3mf(this.printPreviewScene.getObjectByName("PrintMesh") as Mesh)
		this.downloadFile(compressed3mf, "3mf")
	}

	private makeMapMaxSize(printMesh: Mesh) {
		this.wantedWidth = this.previewMeshBuilder.calculateMaxWidth(new Vector3(this.printers[this.selectedPrinter].x, this.printers[this.selectedPrinter].y, this.printers[this.selectedPrinter].z), this.threeSceneService.getMapMesh().getThreeMesh())
		this.previewMeshBuilder.updateMapSize(printMesh, this.currentWidth, this.wantedWidth)
		this.calculateCurrentSize(printMesh)
		this.maxWidth = this.currentWidth
	}

	private calculateCurrentSize(printMesh: Mesh) {
		const baseplate = printMesh.getObjectByName("Baseplate") as Mesh
		baseplate.geometry.computeBoundingBox()
		const boundingBoxBaseplate = baseplate.geometry.boundingBox

		const map = printMesh.getObjectByName("Map") as Mesh
		map.geometry.computeBoundingBox()
		const boundingBoxMap = map.geometry.boundingBox

		this.currentWidth = boundingBoxBaseplate.max.x - boundingBoxBaseplate.min.x
		this.currentDepth = boundingBoxBaseplate.max.y - boundingBoxBaseplate.min.y
		this.currentHeight = boundingBoxBaseplate.max.z - boundingBoxBaseplate.min.z + boundingBoxMap.max.z - boundingBoxMap.min.z
	}

	private initGeometryOptions(): GeometryOptions {
		const attributeDescriptors = this.state.getValue().fileSettings.attributeDescriptors
		const fallbackTitles: Map<string, string> = metricTitles

		const areaMetricTitle = attributeDescriptors[this.areaMetric]?.title || fallbackTitles.get(this.areaMetric)
		const heightMetricTitle = attributeDescriptors[this.heightMetric]?.title || fallbackTitles.get(this.heightMetric)
		const colorMetricTitle = attributeDescriptors[this.colorMetric]?.title || fallbackTitles.get(this.colorMetric)

		return {
			width: this.wantedWidth,
			areaMetricTitle,
			areaMetricData: this.nodeMetricData.find(metric => metric.name === this.areaMetric),
			heightMetricTitle,
			heightMetricData: this.nodeMetricData.find(metric => metric.name === this.heightMetric),
			colorMetricTitle,
			colorMetricData: this.nodeMetricData.find(metric => metric.name === this.colorMetric),
			colorRange: this.state.getValue().dynamicSettings.colorRange,
			frontText: this.frontText,
			defaultMaterial: (this.threeSceneService.getMapMesh().getThreeMesh().material[0].clone() as ShaderMaterial),
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
