import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton.component"
import { DownloadCustomConfigService } from "./downloadCustomConfig.service"
import { BehaviorSubject } from "rxjs"
import { TestBed } from "@angular/core/testing"
import { DownloadableConfigs } from "./downloadableCustomConfigsHelper"

class MockDownloadCustomConfigService {
	get downloadableCustomConfig$() {
		return new BehaviorSubject<DownloadableConfigs>(new Map([["test", null]]))
	}
}

describe("DownloadCustomConfigButtonComponent", () => {
	let comp: DownloadCustomConfigsButtonComponent
	let mockDownloadCustomConfigService

	beforeEach(() => {
		mockDownloadCustomConfigService = new MockDownloadCustomConfigService()
		TestBed.configureTestingModule({
			providers: [
				DownloadCustomConfigsButtonComponent,
				{ provide: DownloadCustomConfigService, useValue: mockDownloadCustomConfigService }
			]
		})
		comp = TestBed.inject(DownloadCustomConfigsButtonComponent)
	})

	it("should ", async () => {
		comp.ngOnInit()
		/*		const component = await render(DownloadCustomConfigsButtonComponent)
		const button = component.getByRole("button")
		console.log(button.title)*/

		expect(comp.downloadableConfigs.get("test")).toEqual(null)
	})
})
