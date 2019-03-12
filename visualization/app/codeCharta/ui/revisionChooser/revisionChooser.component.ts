import { SettingsService } from "../../state/settings.service"
import "./revisionChooser.component.scss"
import "./revisionChooserFileDropDown.component.scss"
import {FileSelectionState, FileState, MetricData} from "../../codeCharta.model";
import {IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements FileStateServiceSubscriber {

    private _viewModel: {
        renderState: FileSelectionState,
        fileStates: FileState[],
        referenceFileState: FileState
    } = {
        renderState: null,
        fileStates: [],
        referenceFileState: null
    }

    /* @ngInject */
    constructor(
        private fileStateService: FileStateService,
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService
    ) {
        FileStateService.subscribe(this.$rootScope, this)
    }

    public onFileSelectionStatesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {

        this._viewModel.renderState = FileStateService.getRenderState(fileStates)

        if (renderState == FileSelectionState.Comparison) {
            fileStates.filter(x => x.selectedAs == FileSelectionState.Comparison || x.selectedAs == FileSelectionState.Reference)

        } else if (renderState == FileSelectionState.Partial){
            fileStates.filter(x => x.selectedAs == FileSelectionState.Partial)

        } else {
            this._viewModel.referenceFileState = fileStates.find(x => x.selectedAs == FileSelectionState.Single)
        }
    }

    public onImportedFilesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {
        this._viewModel.fileStates = fileStates
    }

    public onReferenceChange(fileName: string) {
        const matchingFileState = this.fileStateService.getFileStateByFileName(fileName)
        this.fileStateService.setSingle(matchingFileState.file)
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
