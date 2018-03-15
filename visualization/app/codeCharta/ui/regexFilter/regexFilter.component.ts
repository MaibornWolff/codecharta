import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";
import "./regexFilter.component.scss";
import * as d3 from "d3";
import {HierarchyNode} from "d3-hierarchy";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";

export class RegexFilterController implements SettingsServiceSubscriber, DataServiceSubscriber {

    public mapRoot: CodeMapNode = null;

    public viewModel = {
        filter: ""
    }

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
    }

    onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.settingsService.settings.map);
    }

    onFilterChange(regex: string) {
        this.updateVisibilities();
    }

    private updateVisibilities(mapRoot: CodeMapNode = this.mapRoot) {
        if(mapRoot){
            let h = d3.hierarchy<CodeMapNode>(mapRoot);
            h.each((n: HierarchyNode<CodeMapNode>) => {
                n.data.visible = this.getCorrectNodeVisibility(n.data);
            });
            this.settingsService.onSettingsChanged();
        }
    }

    private getCorrectNodeVisibility(node: CodeMapNode, regex: string = this.viewModel.filter): boolean {
        return (node.path + "/" + node.name).match(regex) !== null;
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.root) {
            this.$timeout(()=>{
                this.mapRoot = map.root;
            },100);
        }
    }

}

export const regexFilterComponent = {
    selector: "regexFilterComponent",
    template: require("./regexFilter.component.html"),
    controller: RegexFilterController
};




