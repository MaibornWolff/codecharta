import { IRootScopeService } from "angular";
import {CodeMapNode, FileState} from "../../codeCharta.model";
import { CodeMapRenderService } from "../codeMap/codeMap.render.service";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";

export class MapTreeViewController implements FileStateServiceSubscriber {

    private _viewModel: {
        rootNode: CodeMapNode
    } = {
        rootNode: null
    };

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private codeMapRenderService: CodeMapRenderService
    ) {
        FileStateService.subscribe(this.$rootScope, this);
    }

    public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
        this._viewModel.rootNode = this.codeMapRenderService.getRenderFile().map
        console.log(this._viewModel.rootNode)
    }

    public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
    }
}

export const mapTreeViewComponent = {
    selector: "mapTreeViewComponent",
    template: require("./mapTreeView.component.html"),
    controller: MapTreeViewController
};




