import { render } from "@testing-library/angular"
import { addBlacklistItem } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { Store } from "../../../state/store/store"
import { SearchPanelModeSelectorComponent } from "./searchPanelModeSelector.component"

describe("SearchPanelModeSelectorComponent", () => {
	it("should not show blacklist items indicator when there are no blacklist items", async () => {
		const { container } = await render(SearchPanelModeSelectorComponent)

		expect(container.querySelector(".has-blacklist-items-indicator")["hidden"]).toBe(true)
	})

	it("should show blacklist items indicator when there are blacklist items", async () => {
		Store.dispatch(addBlacklistItem({ path: "something.ts", type: "exclude" }))

		const { container } = await render(SearchPanelModeSelectorComponent)
		expect(container.querySelector(".has-blacklist-items-indicator")["hidden"]).toBe(false)
	})
})
