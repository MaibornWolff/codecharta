import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./blacklistPanel.component.scss";
import {Exclude} from "../../core/data/model/CodeMap";
import {CodeMapUtilService} from "../codeMap/codeMap.util.service";
import * as d3 from "d3";
export class BlacklistPanelController implements SettingsServiceSubscriber{

    public blacklist: Array<Exclude>;

    public viewModel = {
        itemPath: "",
        itemType: "File",
        error: "",
    };

    constructor(private settingsService: SettingsService,
                private codeMapUtilService: CodeMapUtilService) {
        settingsService.subscribe(this);

        if(settingsService.settings.blacklist) {
            this.blacklist = settingsService.settings.blacklist;
        }
    }

    onChange() {
        this.settingsService.onSettingsChanged();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        if(settings.blacklist) {
            this.blacklist = settings.blacklist;
        }
    }

    removeBlacklistEntry(entry: Exclude){
        this.settingsService.includeNode(entry);
        this.onChange();
    }

    addBlacklistEntry(){
        this.viewModel.itemPath = this.removeLastCharacterIfSeparator(this.viewModel.itemPath);
        if (this.isValidNode()) {
            this.settingsService.settings.blacklist.push({path: this.viewModel.itemPath, type: this.viewModel.itemType});
            this.onChange()
        }
    }

    private isValidNode() {
        const nodes = d3.hierarchy(this.settingsService.settings.map.root).descendants().map(d=>d.data);

        if (this.viewModel.itemPath.length == 0) {
            this.viewModel.error = "Invalid empty pattern";
        } else if (CodeMapUtilService.numberOfBlacklistedNodes(nodes, [{path: this.viewModel.itemPath, type: "Folder"}]) === 0) {
            this.viewModel.error = "Pattern not found";
        } else if (this.isAlreadyBlacklistedNode()) {
            this.viewModel.error = "Pattern already blacklisted";
        } else {
            this.viewModel.error = "";
            return true;
        }
        return false;
    }

    private isAlreadyBlacklistedNode() {
        return this.blacklist.filter(item => {
            return this.viewModel.itemPath == item.path &&
                this.viewModel.itemType == item.type
        }).length != 0;
    }

    private removeLastCharacterIfSeparator(path: string) {
        return (path[path.length - 1] == "/") ? path.substr(0, path.length - 1 ) : path
    }

    sortByFolder(item: Exclude) {
        return (item && item.type == "Folder") ? 0 : 1;
    }
}

export const blacklistPanelComponent = {
    selector: "blacklistPanelComponent",
    template: require("./blacklistPanel.component.html"),
    controller: BlacklistPanelController
};