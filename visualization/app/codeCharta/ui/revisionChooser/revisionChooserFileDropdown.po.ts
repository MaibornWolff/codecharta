export class RevisionChooserFileDropDownPageObject {

    constructor(private page) {}

    public async getSelectedName() {
        return await this.page.evaluate(() => document.querySelector('revision-chooser-file-drop-down-component md-select .md-text')["innerText"]);
    }

    public async clickChooser() {
        return this.page.click("revision-chooser-file-drop-down-component md-select");
    }

    public async getAllNames() {
        let content = await this.page.evaluate(() => document.querySelector('.md-select-menu-container.md-active > md-select-menu')["innerText"]);
        return content.split("\n");
    }

}