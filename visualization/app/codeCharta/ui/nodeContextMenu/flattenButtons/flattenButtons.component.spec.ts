import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { FlattenButtonsComponent } from "./flattenButtons.component"
import { FlattenButtonsModule } from "./flattenButtons.module"
import { NodeType } from "../../../codeCharta.model"

describe("flattenButtonsComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FlattenButtonsModule]
		})
	})

	it("should show flatten button for a not flattened node", async () => {
		await render(FlattenButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo.ts", type: NodeType.FILE, isFlattened: false } }
		})

		expect(screen.queryByText("Show")).toBe(null)
		expect(screen.queryByText("Flatten")).not.toBe(null)
	})

	it("should show un-flatten button for a flattened node", async () => {
		await render(FlattenButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo.ts", type: NodeType.FILE, isFlattened: true } }
		})

		expect(screen.queryByText("FlattenShow")).toBe(null)
		expect(screen.queryByText("Show")).not.toBe(null)
	})
})
