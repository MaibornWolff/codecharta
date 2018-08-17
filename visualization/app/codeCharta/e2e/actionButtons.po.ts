export class ActionButtonsPageObject {

    constructor(private page) {}

    async toggleSideMenu() {
        const selector = '#actionButtons > button:nth-child(3)';
        return this.page.click(selector);
    }

}