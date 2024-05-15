import { DownloadCustomConfigsButtonComponent } from "./downloadCustomConfigsButton.component"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { of } from "rxjs"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { FileDownloader } from "../../../util/fileDownloader"

const mockedDownloadCustomConfigService = { downloadableCustomConfigs$: null }

describe("DownloadCustomConfigButtonComponent", () => {
    beforeEach(() => {
        FileDownloader.downloadData = jest.fn()
        TestBed.configureTestingModule({
            providers: [{ provide: CustomConfigHelperService, useValue: mockedDownloadCustomConfigService }]
        })
    })

    it("should disable download button when no custom configs are available ", async () => {
        mockedDownloadCustomConfigService.downloadableCustomConfigs$ = of(new Map())
        await render(DownloadCustomConfigsButtonComponent)

        expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true)
    })

    it("should click download button when custom configs are available ", async () => {
        mockedDownloadCustomConfigService.downloadableCustomConfigs$ = of(new Map([["invalid-md5", {}]]))
        await render(DownloadCustomConfigsButtonComponent)

        expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false)

        await userEvent.click(screen.getByRole("button") as HTMLButtonElement)

        expect(FileDownloader.downloadData).toHaveBeenCalledTimes(1)
    })
})
