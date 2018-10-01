import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./blacklistPanel.component.scss";
import {Exclude} from "../../core/data/model/CodeMap";

export class BlacklistPanelController implements SettingsServiceSubscriber{

    public blacklist: Array<Exclude>;
    public newItemPath: string;
    public newItemType: string = "File";

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
        if (this.isValidNode(this.newItemPath, this.newItemType)) {
            this.settingsService.settings.blacklist.push({path: this.newItemPath, type: this.newItemType});
            this.onChange()
        }
    }

    private isValidNode(itemPath: string, itemType: string) {

        const equalExcludeItem = this.blacklist.filter(item => {
            return itemPath == item.path && itemType == item.type
        });

        return itemPath.length > 0 && equalExcludeItem.length == 0;
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