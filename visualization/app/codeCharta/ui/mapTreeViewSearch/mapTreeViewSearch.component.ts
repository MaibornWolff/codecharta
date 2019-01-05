import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode, ExcludeType} from "../../core/data/model/CodeMap";
import "./mapTreeViewSearch.component.scss";
import * as d3 from "d3";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";

export class MapTreeViewSearchController implements SettingsServiceSubscriber, DataServiceSubscriber {

    private static TIMEOUT_DELAY_MS = 100;

    public mapRoot: CodeMapNode = null;

    public viewModel = {
        searchPattern: "",
        fileCount: 0,
        folderCount: 0,
        blacklistType: ExcludeType.hide,
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
        this.viewModel.searchPattern = "";
    }

    onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.settingsService.settings.map);
    }

    onFilterChange() {
        this.setSearchedNodePathnames();
    }

    onClickBlacklistPattern(blacklistType: ExcludeType) {
        this.viewModel.blacklistType = blacklistType;

        if (!this.isPatternBlacklisted()) {
            this.settingsService.settings.blacklist.push(
                {path: this.viewModel.searchPattern, type: this.viewModel.blacklistType}
            );
            this.settingsService.applySettings();
        }
    }

    private isPatternBlacklisted() {
        return this.settingsService.settings.blacklist.filter(item => {
            return this.viewModel.searchPattern == item.path &&
                this.viewModel.blacklistType == item.type
        }).length != 0;
    }

    private setSearchedNodePathnames() {
        const s = this.settingsService.settings;
        const nodes = d3.hierarchy(s.map.root).descendants().map(d => d.data);
        const searchedNodes = CodeMapUtilService.getNodesByGitignorePath(nodes, this.viewModel.searchPattern);

        s.searchedNodePaths = searchedNodes.map(n => n.path);
        this.viewModel.folderCount = searchedNodes.filter(node => node.children && node.children.length != 0).length;
        this.viewModel.fileCount = searchedNodes.length - this.viewModel.folderCount;
        this.settingsService.applySettings(s);
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.root) {
            this.$timeout(()=>{
                this.mapRoot = map.root;
            }, MapTreeViewSearchController.TIMEOUT_DELAY_MS);
        }
    }
}

export const mapTreeViewSearchComponent = {
    selector: "mapTreeViewSearchComponent",
    template: require("./mapTreeViewSearch.component.html"),
    controller: MapTreeViewSearchController
};




