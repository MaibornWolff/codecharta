import "./export3DMapButton.component.scss"
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
import { Mesh } from "three"

@Component({
	selector: "cc-export-threed-map-button",
	template: require("./export3DMapButton.component.html")
})
export class Export3DMapButtonComponent {
	private fileName: string
	private files: FileState[]
	private exporter = new STLExporter()

	constructor(@Inject(Store) store: Store) {
		store.select(accumulatedDataSelector).subscribe(accumulatedData => {
			this.fileName = accumulatedData.unifiedFileMeta?.fileName
		})
		store.select(filesSelector).subscribe(files => {
			this.files = files
		})
	}

	downloadStlFile() {
		const threeMesh: Mesh = ThreeSceneService.mapMeshInstance.getThreeMesh()
		const exportedBinaryFile = this.exporter.parse(threeMesh, { binary: true })
		const fileName = `${FileNameHelper.getNewFileName(this.fileName, isDeltaState(this.files))}.stl`
		FileDownloader.downloadData(exportedBinaryFile, fileName)
	}
}
