import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { MaterialModule } from "../../../../material/material.module"
import { BlacklistType } from "../../../codeCharta.model"
import { setBlacklist } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { Store } from "../../../state/store/store"
import { BlacklistPanelComponent } from "./blacklistPanel.component"

const placeholderText = "Add pattern via search or node context-menu"

describe("blacklistPanel", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [MaterialModule]
		})
	})

	it("should have place holder texts when there are no flattened nor excluded items", async () => {
		await render(BlacklistPanelComponent)
		expect(screen.getAllByText(placeholderText).length).toBe(2)
	})

	it("should display all flattened and excluded items in the correct section and remove an item on click", async () => {
		Store.dispatch(
			setBlacklist([
				{ type: BlacklistType.flatten, path: "some/flattened/building.ts" },
				{ type: BlacklistType.exclude, path: "some/excluded/building.ts" }
			])
		)
		await render(BlacklistPanelComponent)

		expect(screen.queryByText(placeholderText)).toBe(null)
		expect(screen.getByText("some/flattened/building.ts")).not.toBe(null)
		expect(screen.getByText("some/excluded/building.ts")).not.toBe(null)

		await userEvent.click(screen.getByText("some/excluded/building.ts"))
		expect(Store.store.getState().fileSettings.blacklist).not.toContainEqual({
			type: BlacklistType.exclude,
			path: "some/excluded/building.ts"
		})
	})
})
