import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { expect } from "@jest/globals"
import { MatchingFilesCounterComponent } from "./matchingFilesCounter.component"
import { MatchingFilesCounterModule } from "./matchingFilesCounter.module"
import { provideMockStore } from "@ngrx/store/testing"
import { matchingFilesCounterSelector } from "./selectors/matchingFilesCounter.selector"

describe("MatchingFilesCounterComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MatchingFilesCounterModule],
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: matchingFilesCounterSelector,
							value: {
								fileCount: "2/3",
								flattenCount: "1/1",
								excludeCount: "0/1"
							}
						}
					]
				})
			]
		})
	})

	it("should render and show matching files counter data", async () => {
		const { container } = await render(MatchingFilesCounterComponent, { excludeComponentDeclaration: true })
		const searchContainer = container.querySelector("[title='Files matching search pattern']")
		const flattenedContainer = container.querySelector("[title='Files flattened']")
		const excludedContainer = container.querySelector("[title='Files excluded']")

		expect(searchContainer.textContent).toMatch(/2\/3/)
		expect(flattenedContainer.textContent).toMatch(/1\/1/)
		expect(excludedContainer.textContent).toMatch(/0\/1/)
	})
})
