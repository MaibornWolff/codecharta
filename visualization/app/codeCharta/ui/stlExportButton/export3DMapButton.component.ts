import { Component, Inject } from "@angular/core"
import { FileDownloader } from "../../util/fileDownloader"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { FileNameHelper } from "../../util/fileNameHelper"
import { isDeltaState } from "../../model/files/files.helper"
import { Store } from "../../state/angular-redux/store"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { filesSelector } from "../../state/store/files/files.selector"
import { FileState } from "../../model/files/files"

@Component({
	selector: "cc-export-threed-map-button",
	template: require("./export3DMapButton.component.html")
})
export class Export3DMapButtonComponent {
	private fileName: string
	private files: FileState[]
	exporter = new STLExporter()

	constructor(@Inject(Store) private store: Store) {
		store.select(accumulatedDataSelector).subscribe(accumulatedData => {
			this.fileName = accumulatedData.unifiedFileMeta?.fileName
		})
		store.select(filesSelector).subscribe(files => {
			this.files = files
		})
	}

	downloadStlFile() {
		this.exportBinary(ThreeSceneService.mapMeshInstance.getThreeMesh())
	}

	private exportBinary(mesh) {
		const result = this.exporter.parse(mesh, { binary: true })
		const fileName = `${FileNameHelper.getNewFileName(this.fileName, isDeltaState(this.files))}.stl`
		FileDownloader.downloadData(result, fileName)
	}
}
