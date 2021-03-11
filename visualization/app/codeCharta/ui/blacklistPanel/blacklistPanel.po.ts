
export class BlacklistPanelPageObject {
	async checkExludedListAfterExclusion() {

		await page.waitForSelector('#excludedList', {visible : true, hidden : false} )

		const selector = '#excludedList > md-list-item > div.pattern-text.layout-column > p > bdi'
			
		const list = await page.$$eval(selector, ls => {
			return ls.filter(x => {
				return x.innerHTML === "*html*" || x.innerHTML === "*ts*"
			})
		})

		return list.length === 2		
	}

	async checkExludedListAfterItemRemovalFromExclusionList() {
		await page.waitForSelector('#excludedList', {visible : true, hidden : false} )

		await page.waitForSelector("#object-1", {visible: true})
			.then(el => el.click())
			.catch(err => console.log(err))
		await page.waitForTimeout(500)	

		const selector = '#excludedList > md-list-item > div.pattern-text.layout-column > p > bdi'

		const list = await page.$$eval(selector, ls => {
			return ls.map(x => {
				return x.innerHTML 
			})
		})
		return list.includes("*html*") && !list.includes("*ts*")	
	}
}