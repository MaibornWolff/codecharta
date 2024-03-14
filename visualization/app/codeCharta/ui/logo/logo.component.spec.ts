import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import packageJson from "../../../../package.json"
import { LogoComponent } from "./logo.component"
import { LogoModule } from "./logo.module"

describe("metricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LogoModule]
		})
	})

	it("should display correct version", async () => {
		const { fixture } = await render(LogoComponent, {
			excludeComponentDeclaration: true
		})

		const version = packageJson.version
		expect(fixture.elementRef.nativeElement.querySelector("h2").textContent).toContain(version)
	})
})
