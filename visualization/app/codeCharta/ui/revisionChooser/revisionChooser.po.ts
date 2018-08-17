export class RevisionChooserPageObject {

    constructor(private page) {}

    async getSelectedName() {
        return await this.page.evaluate(() => document.querySelector('revision-chooser-component md-select .md-text')["innerText"]);
    }

    async clickChooser() {
        return this.page.click("revision-chooser-component md-select");
    }

    async getAllNames() {
        let content = await this.page.evaluate(() => document.querySelector('.md-select-menu-container.md-active > md-select-menu')["innerText"]);
        return content.split("\n");
    }

}