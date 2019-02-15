export class RibbonBarPageObject {

    constructor(private page) {}

    public async toggle() {
        const selector = '#toggle-ribbon-bar-fab';
        return this.page.click(selector);
    }

}