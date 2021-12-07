import { Component, Inject, Input, OnDestroy } from "@angular/core"
import { FilePanelState } from "../filePanel.component"
import { ISelectedFileNameList } from "./ISelectedFileNameList"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { Subscription } from "rxjs"

import { fileStatesAvailable, getVisibleFileStates, isDeltaState, isPartialState, isSingleState } from "../../../model/files/files.helper"
import { Store } from "../../../state/angular-redux/store"
import { filesSelector } from "../../../state/store/files/files.selector"
import { setDeltaByNames, setMultipleByNames, setSingleByName } from "../../../state/store/files/files.actions"
import { CodeChartaService } from "../../../codeCharta.service"

@Component({
	selector: "cc-file-panel-state-buttons",
	template: require("./filePanelStateButtons.component.html")
})
export class FilePanelStateButtonsComponent implements OnDestroy {
	@Input() state: FilePanelState
	private lastRenderState: FileSelectionState
	private selectedFileNames: ISelectedFileNameList = {
		single: null,
		delta: {
			reference: null,
			comparison: null
		},
		partial: []
	}
	private files: FileState[]
	private isSingleState: boolean
	// @ts-ignore
	private isPartialState: boolean
	private isDeltaState: boolean
	// @ts-ignore
	private pictogramUpperColor: string
	// @ts-ignore
	private pictogramFirstFileColor: string
	private renderState: FileSelectionState
	// @ts-ignore
	private pictogramLowerColor: string
	private fileSubscription: Subscription

	constructor(@Inject(Store) private store: Store) {
		// file settings for onFilesSelectionChanged
		this.fileSubscription = this.store.select(filesSelector).subscribe(files => this.onFilesSelectionChanged(files))
	}

	ngOnDestroy(): void {
		this.fileSubscription.unsubscribe()
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.files = files
		this.isSingleState = isSingleState(files)
		this.isPartialState = isPartialState(files)
		this.isDeltaState = isDeltaState(files)
		this.setPictogramColor()
		this.updateSelectedFileNamesInViewModel()
		this.lastRenderState = this.renderState
	}

	onSingleFileChange(singleFileName: string) {
		this.store.dispatch(setSingleByName(singleFileName))
		const rootName = this.files.find(x => x.selectedAs === FileSelectionState.Single).file.map.name
		CodeChartaService.updateRootData(rootName)
	}

	onDeltaReferenceFileChange(referenceFileName: string) {
		const rootName = this.files.find(x => x.file.fileMeta.fileName === referenceFileName).file.map.name
		CodeChartaService.updateRootData(rootName)
		this.store.dispatch(setDeltaByNames(referenceFileName, this.selectedFileNames.delta.comparison))
	}

	onDeltaComparisonFileChange(comparisonFileName: string) {
		const referenceFileName = this.selectedFileNames.delta.reference
		const rootName = this.files.find(x => x.file.fileMeta.fileName === referenceFileName).file.map.name
		CodeChartaService.updateRootData(rootName)
		this.store.dispatch(setDeltaByNames(referenceFileName, comparisonFileName))
	}

	onPartialFilesChange(partialFileNames: string[]) {
		if (partialFileNames.length > 0) {
			this.store.dispatch(setMultipleByNames(partialFileNames))
		} else {
			this.selectedFileNames.partial = []
		}
	}

	onStandardStateSelected() {
		// Todo: Add functionality for click Event
	}

	onDeltaStateSelected() {
		this.selectedFileNames.delta.reference = this.getLastVisibleFileName()
		this.onDeltaComparisonFileChange(null)
	}

	private getLastVisibleFileName() {
		if (this.lastRenderState === FileSelectionState.Single) {
			return this.selectedFileNames.single
		}
		if (this.lastRenderState === FileSelectionState.Partial) {
			const visibleFileStates = getVisibleFileStates(this.files)
			if (fileStatesAvailable(this.files)) {
				return visibleFileStates[0].file.fileMeta.fileName
			}
			return this.files[0].file.fileMeta.fileName
		}
		if (this.lastRenderState === FileSelectionState.Comparison) {
			return this.selectedFileNames.delta.reference
		}
	}

	private setPictogramColor() {
		this.pictogramFirstFileColor = "#808080"
		// Todo: Get colors for positive and negative Delta from store
		this.pictogramUpperColor = "#808080"
		this.pictogramLowerColor = "#808080"
		// this.pictogramUpperColor = this.storeService.getState().appSettings.mapColors.positiveDelta
		// this.pictogramLowerColor = this.storeService.getState().appSettings.mapColors.negativeDelta
	}

	private updateSelectedFileNamesInViewModel() {
		const visibleFileStates = getVisibleFileStates(this.files)
		// Todo: Remove / Update SingleState
		if (this.isSingleState) {
			this.renderState = FileSelectionState.Single
			this.selectedFileNames.single = visibleFileStates[0].file.fileMeta.fileName
		} else if (this.isDeltaState) {
			this.renderState = FileSelectionState.Comparison

			let reference = visibleFileStates[0].file.fileMeta.fileName
			let comparison = visibleFileStates[visibleFileStates.length - 1].file.fileMeta.fileName
			if (visibleFileStates[0].selectedAs === FileSelectionState.Comparison) {
				const temporary = comparison
				comparison = reference
				reference = temporary
			}
			this.selectedFileNames.delta.reference = reference
			this.selectedFileNames.delta.comparison = comparison
		} else {
			this.renderState = FileSelectionState.Partial
			this.selectedFileNames.partial = visibleFileStates.map(x => x.file.fileMeta.fileName)
		}
	}
}
