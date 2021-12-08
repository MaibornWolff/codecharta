import { Component } from "@angular/core"
import { FileDownloader } from "../../util/fileDownloader"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { CodeMapMeshChangedSubscriber, ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapMesh } from "../codeMap/rendering/codeMapMesh"

@Component({
	selector: "cc-export-threed-map-button",
	template: require("./export3DMapButton.component.html")
})
export class Export3DMapButtonComponent implements CodeMapMeshChangedSubscriber {
	private mesh: CodeMapMesh
	exporter = new STLExporter()

	onCodeMapMeshChanged(mapMesh: CodeMapMesh) {
		this.mesh = mapMesh
	}

	constructor() {
		// @ts-ignore
		ThreeSceneService.subscribeToCodeMapMeshChangedEvent()
	}

	downloadStlFile() {
		this.exportBinary(this.mesh)
	}
	private exportBinary(mesh) {
		const result = this.exporter.parse(mesh, { binary: true })
		this.saveArrayBuffer(result, "box.stl")
	}
	private saveArrayBuffer(buffer, filename) {
		FileDownloader.downloadData(buffer, filename)
	}
}
