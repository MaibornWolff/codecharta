export class RibbonBarPageObject {

    constructor(private page) {}

    async toggle() {
        const selector = '#toggle-ribbon-bar-fab';
        return this.page.click(selector);
    }

}