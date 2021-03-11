import { clickButtonOnPageElement } from "../../../puppeteer.helper";

export class SearchBarPageObject {
	async enterAndExcludeSearchPattern() {
		
		await page.waitForSelector("#searchInput", { visible: true })
			.then(el => {
				el.focus()
				el.type('html,ts');
			})
			.catch(err => console.log(err))		
       
		await page.waitForTimeout(500)	

        await clickButtonOnPageElement("#blacklistMenu", );
		await page.waitForSelector("#blacklistMenu", {visible : true})
			.then(el => el.click())
			.catch(err => console.log(err))	

		await page.waitForTimeout(500)	

		await page.waitForSelector("#toExcludeButton", {visible: true})
			.then(el => el.click())
			.catch(err => console.log(err))
		
	}
}
