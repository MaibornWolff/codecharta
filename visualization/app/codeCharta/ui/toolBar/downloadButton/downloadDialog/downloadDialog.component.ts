import { Component, ViewEncapsulation } from "@angular/core"
import { FileDownloader } from "../../../../util/fileDownloader"
import { accumulatedDataSelector } from "../../../../state/selectors/accumulatedData/accumulatedData.selector"
import { FileNameHelper } from "../../../../util/fileNameHelper"
import { isDeltaState } from "../../../../model/files/files.helper"
import {
	DownloadableProperty,
	getAmountOfAttributeTypes,
	getAmountOfNodes,
	getDownloadableProperty,
	getFilteredBlacklistLength
} from "./util/propertyHelper"
import { State as StateService } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"

@Component({
	templateUrl: "./downloadDialog.component.html",
	styleUrls: ["./downloadDialog.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class DownloadDialogComponent {
	fileName: string
	properties: (DownloadableProperty & { change: (isSelected: boolean) => void })[]

	constructor(private state: StateService<CcState>) {
		const stateValue = this.state.getValue()
		const { unifiedMapNode, unifiedFileMeta } = accumulatedDataSelector(stateValue)
		const { fileSettings, files } = stateValue
		const { attributeTypes } = fileSettings
		const { edges, markedPackages, blacklist } = fileSettings
		this.fileName = FileNameHelper.getNewFileName(unifiedFileMeta.fileName, isDeltaState(files))
		this.properties = [
			this.getProperty(0, {
				name: "Nodes",
				amount: getAmountOfNodes(unifiedMapNode),
				isSelected: true,
				isDisabled: true
			}),
			this.getProperty(1, {
				name: "AttributeTypes",
				amount: getAmountOfAttributeTypes(attributeTypes),
				isSelected: true,
				isDisabled: true
			}),
			this.getProperty(2, getDownloadableProperty("Edges", edges.length)),
			this.getProperty(3, getDownloadableProperty("MarkedPackages", markedPackages.length)),
			this.getProperty(4, getDownloadableProperty("Excludes", getFilteredBlacklistLength(blacklist, "exclude"))),
			this.getProperty(5, getDownloadableProperty("Flattens", getFilteredBlacklistLength(blacklist, "flatten")))
		]
	}

	download() {
		const state = this.state.getValue()
		const { unifiedMapNode, unifiedFileMeta } = accumulatedDataSelector(state)
		FileDownloader.downloadCurrentMap(
			unifiedMapNode,
			unifiedFileMeta,
			state.fileSettings,
			this.properties.filter(property => property.isSelected).map(property => property.name),
			this.fileName
		)
	}

	private getProperty(index: number, downloadableProperty: DownloadableProperty) {
		return {
			...downloadableProperty,
			change: (isSelected: boolean) => (this.properties[index].isSelected = isSelected)
		}
	}
}
