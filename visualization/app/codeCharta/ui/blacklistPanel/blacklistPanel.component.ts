import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./blacklistPanel.component.scss";
import {Exclude, ExcludeType} from "../../core/data/model/CodeMap";

export class BlacklistPanelController implements SettingsServiceSubscriber{

    public blacklist: Array<Exclude>;

    public viewModel = {
        itemPath: "",
        itemType: ExcludeType.exclude,
        error: "",
    };

    constructor(private settingsService: SettingsService) {
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
        if (this.isValidNode()) {
            this.settingsService.settings.blacklist.push({path: this.viewModel.itemPath, type: this.viewModel.itemType});
            this.onChange()
        }
    }

    private isValidNode() {
        if (this.viewModel.itemPath.length == 0) {
            this.viewModel.error = "Invalid empty path";

        } else if (this.isAlreadyBlacklistedNode()) {
            this.viewModel.error = this.viewModel.itemType + " is blacklisted";

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

    sortByExcludes(item: Exclude) {
        return (item && item.type == ExcludeType.exclude) ? 0 : 1;
    }
}

export const blacklistPanelComponent = {
    selector: "blacklistPanelComponent",
    template: require("./blacklistPanel.component.html"),
    controller: BlacklistPanelController
};