import {SettingsService} from "../../state/settings.service"
import "./revisionChooser.component.scss"
import "./revisionChooserFileDropDown.component.scss"
import {CCFile, FileSelectionState, FileState} from "../../codeCharta.model";
import {IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {FileStateHelper} from "../../util/fileStateHelper";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements FileStateServiceSubscriber {

    private _viewModel: {
        isSingleState: boolean
        isPartialState: boolean,
        isDeltaState: boolean,
        fileStates: FileState[],
        renderState: string,
        allRenderStates: string[]
        referenceFileName: string,
        comparisonFileName: string,
        partialFileNames: string[]
    } = {
        isSingleState: null,
        isPartialState: null,
        isDeltaState: null,
        fileStates: [],
        renderState: null,
        allRenderStates: null,
        referenceFileName: null,
        comparisonFileName: null,
        partialFileNames: null
    }

    /* @ngInject */
    constructor(
        private fileStateService: FileStateService,
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService
    ) {
        FileStateService.subscribe(this.$rootScope, this)
        this.initAllRenderStates()
    }

    // TODO: get renderFile from codeMapRenderService
    public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {

        this._viewModel.isSingleState = FileStateHelper.isSingleState(fileStates)
        this._viewModel.isPartialState = FileStateHelper.isPartialState(fileStates)
        this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)

        const visibleFileStates = FileStateHelper.getVisibleFileStates(fileStates)

        if (this._viewModel.isSingleState){
            this._viewModel.renderState = this.getEnumAsString(FileSelectionState.Single)
            this._viewModel.referenceFileName = visibleFileStates[0].file.fileMeta.fileName

        } else if (this._viewModel.isPartialState){
            this._viewModel.renderState = this.getEnumAsString(FileSelectionState.Partial)
            this._viewModel.partialFileNames = visibleFileStates.map(x => x.file.fileMeta.fileName)

        } else if(this._viewModel.isDeltaState) {
            this._viewModel.renderState = this.getEnumAsString(FileSelectionState.Comparison)

            if (visibleFileStates.length == 2) {
                this._viewModel.referenceFileName = visibleFileStates.find(x => x.selectedAs == FileSelectionState.Reference).file.fileMeta.fileName
                this._viewModel.comparisonFileName = visibleFileStates.find(x => x.selectedAs == FileSelectionState.Comparison).file.fileMeta.fileName
            } else {
                this._viewModel.referenceFileName = visibleFileStates[0].file.fileMeta.fileName
                this._viewModel.comparisonFileName = visibleFileStates[0].file.fileMeta.fileName
            }
        }
    }

    public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
        this._viewModel.fileStates = fileStates
    }

    public onReferenceChange(referenceFileName: string) {
        const referenceFile: CCFile = FileStateHelper.getFileByFileName(referenceFileName, this.fileStateService.getFileStates())
        this.fileStateService.setSingle(referenceFile)
    }

    public onComparisonChange(comparisonFileName: string) {
        const referenceFile: CCFile = FileStateHelper.getFileByFileName(this._viewModel.referenceFileName, this.fileStateService.getFileStates())
        const comparisonFile: CCFile = FileStateHelper.getFileByFileName(comparisonFileName, this.fileStateService.getFileStates())

        this.fileStateService.setDelta(referenceFile, comparisonFile)
    }

    public onPartialChange(partialFileNames: string[]) {
        let partialFiles: CCFile[] = []

        partialFileNames.forEach(fileName => {
            partialFiles.push(FileStateHelper.getFileByFileName(fileName, this.fileStateService.getFileStates()))
        })

        this.fileStateService.setMultiple(partialFiles)
    }

    public onRenderStateChange(renderState: string){
        if (renderState == this.getEnumAsString(FileSelectionState.Single)) {
            this.onReferenceChange(this._viewModel.referenceFileName)

        } else if (renderState == this.getEnumAsString(FileSelectionState.Partial)) {
            this.selectAllPartialFiles()

        } else if (renderState == this.getEnumAsString(FileSelectionState.Comparison)) {
            this.onComparisonChange(null)
        }
    }

    public selectAllPartialFiles() {
        const allFileNames = this.fileStateService.getFileStates()
            .map(x => x.file.fileMeta.fileName)
        this.onPartialChange(allFileNames)
    }

    public selectZeroPartialFiles() {
        this.onPartialChange([])
    }

    public invertPartialFileSelection() {
        const invertedFileNames: string[] = this.fileStateService.getFileStates()
            .filter(x => x.selectedAs == FileSelectionState.None)
            .map(x => x.file.fileMeta.fileName)

        this.onPartialChange(invertedFileNames)
    }

    private initAllRenderStates() {
        this._viewModel.allRenderStates = [
            this.getEnumAsString(FileSelectionState.Single),
            this.getEnumAsString(FileSelectionState.Partial),
            this.getEnumAsString(FileSelectionState.Comparison)
        ]

    }

    private getEnumAsString(renderState: FileSelectionState): string {
        return FileSelectionState[renderState].toString()
    }
}

export const revisionChooserComponent = {
	selector: "revisionChooserComponent",
	template: require("./revisionChooser.component.html"),
	controller: RevisionChooserController
}
export const revisionChooserFileDropDownComponent = {
	selector: "revisionChooserFileDropDownComponent",
	template: require("./revisionChooserFileDropDown.component.html"),
	controller: RevisionChooserController
}
