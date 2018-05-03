import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";
import "./regexFilter.component.scss";
import * as d3 from "d3";
import {hierarchy, HierarchyNode} from "d3-hierarchy";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import Code = marked.Tokens.Code;

export class RegexFilterController implements SettingsServiceSubscriber, DataServiceSubscriber {

    public mapRoot: CodeMapNode = null;

    public viewModel = {
        filter: "",
        error: ""
    };

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService
    ) {

        this.settingsService.subscribe(this);
        this.dataService.subscribe(this);
        this.updateMapRoot(this.settingsService.settings.map);

    }

    onDataChanged(data: DataModel, event) {
        this.viewModel.filter = "";
        this.viewModel.error = "";
    }

    onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.settingsService.settings.map);
    }

    onFilterChange() {
        this.viewModel.error = "";
        this.updateVisibilities();
    }

    private updateVisibilities(mapRoot: CodeMapNode = this.mapRoot) {
        try {
            if (mapRoot) {
                let h = d3.hierarchy<CodeMapNode>(mapRoot);
                h.each((node: HierarchyNode<CodeMapNode>) => {

                    this.updateVisibilityToFolder(node);
                    this.updateVisibilityToLeaf(node);
                });
                this.settingsService.onSettingsChanged();
            }
        } catch (e) {
            this.viewModel.error = e;
        }
    }

    private updateVisibilityToFolder(node: HierarchyNode<CodeMapNode>) {
        let splitPath = node.data.path.split("/");
        let pathLastNode = splitPath[splitPath.length - 1];

        node.data.visible = (pathLastNode).match(this.viewModel.filter) !== null;
    }

    private updateVisibilityToLeaf(node: HierarchyNode<CodeMapNode>) {
        if ((node.data.name).match(this.viewModel.filter) !== null) {

            this.updateVisibilityToParents(node);
        }
    }

    private updateVisibilityToParents(node: HierarchyNode<CodeMapNode>) {
        node.data.visible = true;

        if (node.parent != null) {
            this.updateVisibilityToParents(node.parent);
        }
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.root) {
            this.$timeout(()=>{
                this.mapRoot = map.root;
            }, 100);
        }
    }

}

export const regexFilterComponent = {
    selector: "regexFilterComponent",
    template: require("./regexFilter.component.html"),
    controller: RegexFilterController
};




