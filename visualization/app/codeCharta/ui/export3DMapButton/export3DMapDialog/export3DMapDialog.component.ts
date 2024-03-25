import { filesSelector } from "../../../state/store/files/files.selector"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { prepareGeometryForPrinting } from "../../../services/3DExports/prepareGeometryForPrinting.service"
import { serialize3mf } from "../../../services/3DExports/serialize3mf.service"
import { FileNameHelper } from "../../../util/fileNameHelper"
import { isDeltaState } from "../../../model/files/files.helper"
import { FileDownloader } from "../../../util/fileDownloader"
import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"

@Component({
	//selector: 'app-mesh-preview-dialog',
	templateUrl: "./export3DMapDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapDialogComponent implements AfterViewInit {
	@ViewChild("rendererContainer") rendererContainer: ElementRef
	isPrintMeshLoaded = false
	private printMesh: Mesh

	constructor(private state: State<CcState>, private threeSceneService: ThreeSceneService) {}

	ngAfterViewInit() {
		this.createScene()
	}

	async createScene() {
		const printPreviewScene = this.threeSceneService.scene.clone(true) as Scene
		const lights = printPreviewScene.children[3]
		const camera = printPreviewScene.children[4] as PerspectiveCamera
		printPreviewScene.children = [lights, camera]
		printPreviewScene.name = "printPreviewScene"

		await this.updatePrintMesh()
		printPreviewScene.add(this.printMesh)

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
	}

	async updatePrintMesh(): Promise<void> {
		this.isPrintMeshLoaded = false

		const printerSideLengths = {
			prusaMk3s: { x: 240, y: 200 },
			bambuA1: { x: 0, y: 0 }
		}
		const printer = "prusaMk3s"

		const width = Math.min(printerSideLengths[printer].x, printerSideLengths[printer].y)
		const geometryOptions = {
			width,
			frontText: "CodeCharta",
			zScale: 1.3
		}

		this.printMesh = await prepareGeometryForPrinting(this.threeSceneService.getMapMesh().getThreeMesh(), geometryOptions)
		this.isPrintMeshLoaded = true
	}

	async download3MFFile() {
		const compressed3mf = await serialize3mf(this.printMesh)
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
