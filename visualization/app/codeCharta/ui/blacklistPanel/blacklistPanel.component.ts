import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./blacklistPanel.component.scss";

export class BlacklistPanelController implements SettingsServiceSubscriber{

    public text: string;

    constructor(private settingsService: SettingsService) {
        settingsService.subscribe(this);

        if(settingsService.settings.blacklist) {
            this.text = settingsService.settings.blacklist.map(b=>b.exclude).join("\n");
        }
    }

    onChange() {
        if(this.settingsService.settings.blacklist) {
            this.settingsService.settings.blacklist = this.text.split("\n").map((b) => {
                return {exclude: b};
            });
        }
        this.settingsService.onSettingsChanged();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        if(settings.blacklist) {
            this.text = settings.blacklist.map(b => b.exclude).join("\n");
        }
    }

}

export const blacklistPanelComponent = {
    selector: "blacklistPanelComponent",
    template: require("./blacklistPanel.component.html"),
    controller: BlacklistPanelController
};