import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { Store } from "../../../state/angular-redux/store"
import { UploadFilesEffect } from "../../../state/effects/uploadFiles/uploadFiles.effect"
import { UploadCustomConfigButtonComponent } from "./uploadCustomConfigButton.component"

describe("uploadCustomConfigButtonComponent", () => {
	const mockedStore = { dispatch: jest.fn() }
	beforeEach(() => {
		mockedStore.dispatch = jest.fn()
		TestBed.configureTestingModule({
			providers: [{ provide: Store, useValue: mockedStore }]
		})
	})

	it("should dispatch an upload action on click", async () => {
		await render(UploadCustomConfigButtonComponent)
		userEvent.click(screen.getByRole("button"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith({ type: UploadFilesEffect.uploadCustomConfigsActionType })
	})
})
