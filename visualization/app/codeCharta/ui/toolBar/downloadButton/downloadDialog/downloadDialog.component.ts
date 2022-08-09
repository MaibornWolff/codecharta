import "./downloadDialog.component.scss"
import { Component, Inject } from "@angular/core"
import { State } from "../../../../state/angular-redux/state"
import { FileDownloader } from "../../../../util/fileDownloader"
import { accumulatedDataSelector } from "../../../../state/selectors/accumulatedData/accumulatedData.selector"
import { FileNameHelper } from "../../../../util/fileNameHelper"
import { isDeltaState } from "../../../../model/files/files.helper"
import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../../codeCharta.model"

type DownloadableProperty = {
	name: string
	amount: number
	isSelected: boolean
	isDisabled: boolean
	change: (isSelected: boolean) => void
}

@Component({
	template: require("./downloadDialog.component.html")
})
export class DownloadDialogComponent {
	fileName: string
	downloadableProperties: DownloadableProperty[]

	constructor(@Inject(State) private state: State) {
		const stateValue = this.state.getValue()
		const { unifiedMapNode, unifiedFileMeta } = accumulatedDataSelector(stateValue)
		const { fileSettings, files } = stateValue
		const { attributeTypes } = fileSettings
		const { edges, markedPackages, blacklist } = fileSettings
		this.fileName = FileNameHelper.getNewFileName(unifiedFileMeta.fileName, isDeltaState(files))
		this.downloadableProperties = [
			{
				name: "Nodes",
				amount: this.getAmountOfNodes(unifiedMapNode),
				isSelected: true,
				isDisabled: true,
				change: (isSelected: boolean) => this.changeSelection(0, isSelected)
			},
			{
				name: "AttributeTypes",
				amount:
					(attributeTypes.nodes ? Object.keys(attributeTypes.nodes).length : 0) +
					(attributeTypes.edges ? Object.keys(attributeTypes.edges).length : 0),
				isSelected: true,
				isDisabled: true,
				change: (isSelected: boolean) => this.changeSelection(1, isSelected)
			},
			this.getDownloadableProperty("Edges", edges.length, 2),
			this.getDownloadableProperty("MarkedPackages", markedPackages.length, 3),
			this.getDownloadableProperty("Excludes", this.getFilteredBlacklistLength(blacklist, BlacklistType.exclude), 4),
			this.getDownloadableProperty("Flattens", this.getFilteredBlacklistLength(blacklist, BlacklistType.flatten), 5)
		]
	}

	download() {
		const state = this.state.getValue()
		const { unifiedMapNode, unifiedFileMeta } = accumulatedDataSelector(state)
		FileDownloader.downloadCurrentMap(
			unifiedMapNode,
			unifiedFileMeta,
			state.fileSettings,
			this.downloadableProperties.filter(property => property.isSelected).map(property => property.name),
			this.fileName
		)
	}

	private getFilteredBlacklistLength(blacklist: BlacklistItem[], blacklistType: BlacklistType) {
		let count = 0
		for (const entry of blacklist) {
			if (entry.type === blacklistType) {
				count++
			}
		}
		return count
	}

	private getDownloadableProperty(name: string, amount: number, index: number): DownloadableProperty {
		return {
			name,
			amount,
			isSelected: amount > 0,
			isDisabled: amount === 0,
			change: (isSelected: boolean) => this.changeSelection(index, isSelected)
		}
	}

	private changeSelection(index: number, isSelected: boolean) {
		this.downloadableProperties[index].isSelected = isSelected
	}

	private getAmountOfNodes(unifiedMapNode: CodeMapNode) {
		let amountOfNodes = 0
		hierarchy(unifiedMapNode).each(() => amountOfNodes++)
		return amountOfNodes
	}
}
