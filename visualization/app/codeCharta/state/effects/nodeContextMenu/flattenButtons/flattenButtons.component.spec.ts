import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { FlattenButtonsComponent } from "./flattenButtons.component"
import { FlattenButtonsModule } from "./flattenButtons.module"
import { NodeType } from "../../../../codeCharta.model"
import userEvent from "@testing-library/user-event"
import { Store } from "../../../store/store"

describe("flattenButtonsComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [FlattenButtonsModule]
		})
	})

	it("should show flatten button for a not flattened node", async () => {
		await render(FlattenButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo.ts", type: NodeType.FILE, isFlattened: false } }
		})

		expect(screen.queryByText("SHOW")).toBe(null)
		expect(screen.queryByText("FLATTEN")).not.toBe(null)

		await userEvent.click(screen.queryByText("FLATTEN"))
		expect(Store.store.getState().fileSettings.blacklist).toContainEqual({
			nodeType: NodeType.FILE,
			path: "/root/foo.ts",
			type: "flatten"
		})
	})

	it("should show un-flatten button for a flattened node", async () => {
		Store.store.getState().fileSettings.blacklist.push({
			nodeType: NodeType.FILE,
			path: "/root/foo.ts",
			type: "flatten"
		})
		await render(FlattenButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo.ts", type: NodeType.FILE, isFlattened: true } }
		})

		expect(screen.queryByText("FLATTEN")).toBe(null)
		expect(screen.queryByText("SHOW")).not.toBe(null)

		await userEvent.click(screen.queryByText("SHOW"))
		expect(Store.store.getState().fileSettings.blacklist).not.toContainEqual({
			nodeType: NodeType.FILE,
			path: "/root/foo.ts",
			type: "flatten"
		})
	})
})
