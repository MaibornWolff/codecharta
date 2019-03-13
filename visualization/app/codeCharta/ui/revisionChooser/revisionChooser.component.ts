import { SettingsService } from "../../state/settings.service"
import "./revisionChooser.component.scss"
import "./revisionChooserFileDropDown.component.scss"
import {FileSelectionState, FileState, CCFile} from "../../codeCharta.model";
import {IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {FileStateHelper} from "../../util/fileStateHelper";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements FileStateServiceSubscriber {

    private _viewModel: {
        isDeltaState: boolean,
        isPartialState: boolean,
        fileStates: FileState[],
        referenceFileName: string
    } = {
        isDeltaState: null,
        isPartialState: null,
        fileStates: [],
        referenceFileName: null
    }

    /* @ngInject */
    constructor(
        private fileStateService: FileStateService,
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService
    ) {
        FileStateService.subscribe(this.$rootScope, this)
    }

    // TODO: get renderFile from codeMapRenderService
    public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {

        this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
        this._viewModel.isPartialState = FileStateHelper.isPartialState(fileStates)

        if (this._viewModel.isDeltaState) {
            fileStates.filter(x => x.selectedAs == FileSelectionState.Comparison || x.selectedAs == FileSelectionState.Reference)

        } else if (this._viewModel.isDeltaState){
            fileStates.filter(x => x.selectedAs == FileSelectionState.Partial)

        } else {
            this._viewModel.referenceFileName = fileStates.find(x => x.selectedAs == FileSelectionState.Single).file.fileMeta.fileName
        }
    }

    public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
        this._viewModel.fileStates = fileStates
    }

    public onReferenceChange(fileName: string) {
        const matchingFile: CCFile = this.fileStateService.getFileStateByFileName(fileName).file
        this.fileStateService.setSingle(matchingFile)
    }

    public onShowChange(){

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
