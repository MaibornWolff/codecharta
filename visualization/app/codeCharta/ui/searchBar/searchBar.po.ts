
export class SearchBarPageObject {
	async enterAndExcludeSearchPattern() {

		await page.waitForSelector("#searchInput", { visible: true })
		await page.type('#searchInput', 'html,ts');
       
        await page.click("#blacklistMenu", {delay : 3000});
		await page.click("#toExcludeButton", {delay : 3000});
	}
}
