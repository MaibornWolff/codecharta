import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {BlacklistType, CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";
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
        hideCount: 0,
        excludeCount: 0,
        isPatternExcluded: true,
        isPatternHidden: true
    };
    private searchedFiles: CodeMapNode[] = [];

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService
    ) {

        this.settingsService.subscribe(this);
        this.dataService.subscribe(this);
        this.updateMapRoot(this.settingsService.settings.map);
    }

    public onDataChanged(data: DataModel, event) {
        this.viewModel.searchPattern = "";
    }

    public onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.settingsService.settings.map);
        this.updateViewModel();
    }

    public onSearchChange() {
        this.setSearchedNodePathnames();
        this.updateViewModel();
    }

    public onClickBlacklistPattern(blacklistType: BlacklistType) {
        this.settingsService.settings.blacklist.push(
            {path: this.viewModel.searchPattern, type: blacklistType}
        );
        this.viewModel.searchPattern = "";
        this.onSearchChange();
    }

    private updateViewModel() {
        const blacklist = this.settingsService.settings.blacklist;
        this.viewModel.isPatternExcluded = this.isPatternBlacklisted(BlacklistType.exclude);
        this.viewModel.isPatternHidden = this.isPatternBlacklisted(BlacklistType.hide);

        this.viewModel.fileCount = this.searchedFiles.length;
        this.viewModel.hideCount = this.searchedFiles.filter(node => CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.hide)).length;
        this.viewModel.excludeCount = this.searchedFiles.filter(node => CodeMapUtilService.isBlacklisted(node, blacklist, BlacklistType.exclude)).length;
    }

    private isPatternBlacklisted(blacklistType: BlacklistType) {
        return this.settingsService.settings.blacklist.filter(item => {
            return this.viewModel.searchPattern == item.path && blacklistType == item.type
        }).length != 0;
    }

    private setSearchedNodePathnames() {
        const s = this.settingsService.settings;
        const nodes = d3.hierarchy(s.map.nodes).descendants().map(d => d.data);
        const searchedNodes = CodeMapUtilService.getNodesByGitignorePath(nodes, this.viewModel.searchPattern);

        this.searchedFiles = searchedNodes.filter(node => !(node.children && node.children.length > 0));
        s.searchedNodePaths = searchedNodes.map(n => n.path);
        s.searchPattern = this.viewModel.searchPattern;

        this.settingsService.applySettings(s);
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.nodes) {
            this.$timeout(()=>{
                this.mapRoot = map.nodes;
            }, MapTreeViewSearchController.TIMEOUT_DELAY_MS);
        }
    }
}

export const mapTreeViewSearchComponent = {
    selector: "mapTreeViewSearchComponent",
    template: require("./mapTreeViewSearch.component.html"),
    controller: MapTreeViewSearchController
};




