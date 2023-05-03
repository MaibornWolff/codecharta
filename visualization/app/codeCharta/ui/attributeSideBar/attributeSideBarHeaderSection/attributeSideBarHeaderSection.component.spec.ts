import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { provideMockStore } from "@ngrx/store/testing"
import { CodeMapNode } from "../../../codeCharta.model"
import { AttributeSideBarModule } from "../attributeSideBar.module"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection.component"
import { IsAttributeSideBarVisibleService } from "../../../services/isAttributeSideBarVisible.service"

describe("attributeSideBarHeaderSection", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AttributeSideBarModule],
			providers: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } }, provideMockStore()]
		})
	})

	it("should have file link when given node has a link", async () => {
		const { container } = await render(AttributeSideBarHeaderSectionComponent, {
			providers: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } }],
			componentProperties: {
				node: { name: "myNode", children: [{}], path: "./myNode.ts", link: "myNode.com" } as CodeMapNode,
				fileName: "myNode.ts"
			}
		})

		expect(container.querySelector("[data-testid=file-link] a[href='myNode.com']")).not.toBe(null)
	})
})
