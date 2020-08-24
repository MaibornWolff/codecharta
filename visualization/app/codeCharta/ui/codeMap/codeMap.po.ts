export class CodeMapPageObject {

    public async rightClickMap() {
        await expect(page).toClick('#codeMap', {button: "right", timeout: 3000})
        await page.waitForSelector('node-context-menu-component', {visible: false})
    }
}
