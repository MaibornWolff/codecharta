export class NodeContextMenuPageObject {

    constructor(private page) {}

    public async hasColorButtons() {
        return this.page.waitForSelector(".colorButton", {
			visible: true
		})
    }

}