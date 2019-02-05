export class SettingsPanelPageObject {

    constructor(private page) {}

    public async toggleMapsPanel() {
        const selector = 'settings-panel-component > md-expansion-panel-group > md-expansion-panel';
        return this.page.click(selector);
    }

}