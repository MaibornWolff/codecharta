import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import packageJson from "../../../../package.json"
import { LogoComponent } from "./logo.component"

describe("metricChooserComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LogoComponent]
        })
    })

    it("should display correct version", async () => {
        const { fixture } = await render(LogoComponent)

        const version = packageJson.version
        expect(fixture.elementRef.nativeElement.querySelector("#logo-version").textContent).toContain(version)
    })
})
