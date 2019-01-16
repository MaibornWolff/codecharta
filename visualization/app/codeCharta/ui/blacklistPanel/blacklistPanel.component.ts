import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./blacklistPanel.component.scss";
import {Exclude, ExcludeType} from "../../core/data/model/CodeMap";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";

export class BlacklistPanelController implements SettingsServiceSubscriber{

    public blacklist: Array<Exclude>;

    constructor(private settingsService: SettingsService,
                private codeMapActionsService: CodeMapActionsService) {
        settingsService.subscribe(this);
        this.onSettingsChanged(settingsService.settings, null);
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
        this.codeMapActionsService.removeBlacklistEntry(entry);
        this.onChange();
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