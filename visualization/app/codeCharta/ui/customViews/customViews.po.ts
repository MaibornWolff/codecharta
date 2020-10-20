export class CustomViewsPageObject {

    async openCustomViewAddDialog() {
        await page.waitForSelector(".custom-views-button.plus",{ visible: true })
        await expect(page).toClick(".custom-views-button.plus", { timeout: 3000 })

        await page.waitForSelector(".custom-view-dialog")
    }

    async isCustomViewAddDialogOpen() {
        await page.waitForSelector(".custom-view-dialog", { visible: true })
    }

    async isCustomViewAddDialogClosed() {
        await page.waitForSelector(".custom-view-dialog", { visible: false })
    }

    async fillInCustomViewName() {
        return expect(page).toFill('.custom-view-input', 'TestViewName')
    }

    async submitAddDialog() {
        return expect(page).toClick('md-dialog-actions .md-primary')
    }

    async isOverrideWarningVisible() {
        return page.waitForSelector(".md-dialog-content .fa-warning", { visible: true })
    }
}
