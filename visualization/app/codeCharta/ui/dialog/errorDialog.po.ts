export class ErrorDialogPageObject {

    constructor(private page) {}

    async getMessage() {
        return await this.page.evaluate(() => document.querySelector('.md-dialog-content-body p')['innerText']);
    }

    async clickOk() {
        const selector = 'md-dialog-actions button';
        return this.page.click(selector);
    }

}