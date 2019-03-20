import { IRootScopeService } from "angular";
import {CCFile, CodeMapNode } from "../../codeCharta.model";
import {CodeMapRenderService, CodeMapRenderServiceSubscriber} from "../codeMap/codeMap.render.service";

export class MapTreeViewController implements CodeMapRenderServiceSubscriber {

    private _viewModel: {
        rootNode: CodeMapNode
    } = {
        rootNode: null
    };

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService
    ) {
        CodeMapRenderService.subscribe(this.$rootScope, this);
    }

    public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
        this._viewModel.rootNode = renderFile.map
    }
}

export const mapTreeViewComponent = {
    selector: "mapTreeViewComponent",
    template: require("./mapTreeView.component.html"),
    controller: MapTreeViewController
};




