import { Component, Inject, OnDestroy } from "@angular/core"
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
export class Export3DMapButtonComponent implements OnDestroy {
	private fileName: string
	private files: FileState[]
	private exporter = new STLExporter()
	private storeSubscriptions = []
	constructor(@Inject(Store) store: Store) {
		this.storeSubscriptions.push(
			store.select(accumulatedDataSelector).subscribe(accumulatedData => {
				this.fileName = accumulatedData.unifiedFileMeta?.fileName
			}),
			store.select(filesSelector).subscribe(files => {
				this.files = files
			})
		)
	}

	downloadStlFile() {
		const threeMesh: Mesh = ThreeSceneService.mapMeshInstance.getThreeMesh()
		const exportedBinaryFile = this.exporter.parse(threeMesh, { binary: true })
		const fileName = `${FileNameHelper.getNewFileName(this.fileName, isDeltaState(this.files))}.stl`
		FileDownloader.downloadData(exportedBinaryFile, fileName)
	}

	ngOnDestroy(): void {
		for (const subscription of this.storeSubscriptions) {
			subscription.unsubscribe()
		}
	}
}
