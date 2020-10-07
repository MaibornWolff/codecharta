export class CustomViewsPageObject {

    public async doSomething() {
        await page.waitForSelector("CSS_SELECTOR")
    	  return await page.$eval("A > CSS_SELECTOR", el => el["someAttribute"])
    }
}
