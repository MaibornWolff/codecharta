import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";
import "./regexFilter.component.scss";
import * as d3 from "d3";
import {HierarchyNode} from "d3-hierarchy";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";

export class RegexFilterController implements SettingsServiceSubscriber, DataServiceSubscriber {

    private static TIMEOUT_DELAY_MS = 100;

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

                    this.updateVisibilityForEachNode(node);
                });
                this.settingsService.onSettingsChanged();
            }
        } catch (e) {
            this.viewModel.error = e;
        }
    }

    private updateVisibilityForEachNode(node: HierarchyNode<CodeMapNode>) {

        let nodePath = (node.data.path).toLowerCase();
        let regexFilter = this.viewModel.filter.toLowerCase();
        let isRegexMatch = nodePath.match(regexFilter) !== null;

        if (isRegexMatch) {
            node.data.visible = true;
            this.showParentNodes(node);
        } else {
            node.data.visible = false;
        }
    }

    private showParentNodes(node: HierarchyNode<CodeMapNode>) {
        node.data.visible = true;

        if (node.parent !== null) {
            this.showParentNodes(node.parent);
        }
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.root) {
            this.$timeout(()=>{
                this.mapRoot = map.root;
            }, RegexFilterController.TIMEOUT_DELAY_MS);
        }
    }

}

export const regexFilterComponent = {
    selector: "regexFilterComponent",
    template: require("./regexFilter.component.html"),
    controller: RegexFilterController
};




