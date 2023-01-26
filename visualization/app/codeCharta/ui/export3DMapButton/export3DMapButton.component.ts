import { Component, ViewEncapsulation } from "@angular/core"
import { FileDownloader } from "../../util/fileDownloader"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { FileNameHelper } from "../../util/fileNameHelper"
import { isDeltaState } from "../../model/files/files.helper"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { filesSelector } from "../../state/store/files/files.selector"
import { Mesh } from "three"
import { State } from "../../state/angular-redux/state"

@Component({
	selector: "cc-export-threed-map-button",
	templateUrl: "./export3DMapButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapButtonComponent {
	private exporter = new STLExporter()
	constructor(private state: State, private threeSceneService: ThreeSceneService) {}

	downloadStlFile() {
		const files = filesSelector(this.state.getValue())
		const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
		const threeMesh: Mesh = this.threeSceneService.getMapMesh().getThreeMesh()
		const exportedBinaryFile = this.exporter.parse(threeMesh, { binary: true })
		const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.stl`
		FileDownloader.downloadData(exportedBinaryFile, downloadFileName)
	}
}
