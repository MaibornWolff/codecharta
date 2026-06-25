import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { ThreeMapControlsService } from "../../../../features/codeMap/facade"
import { METRIC_DATA } from "../../../../util/dataMocks"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { ScreenshotService } from "../../services/screenshot.service"
import { ViewCubeToolboxComponent } from "./viewCubeToolbox.component"

describe("ViewCubeToolboxComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ViewCubeToolboxComponent],
            providers: [
                provideMockStore({ initialState: defaultState, selectors: [{ selector: metricDataSelector, value: METRIC_DATA }] }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeMapControlsService, useValue: { autoFitTo: jest.fn() } },
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } },
                {
                    provide: ScreenshotService,
                    useValue: {
                        makeScreenshotToFile: jest.fn(),
                        makeScreenshotToClipboard: jest.fn(),
                        isWriteToClipboardAllowed: true
                    }
                }
            ]
        })
    })

    it("should render one of each toolbox sub-component", async () => {
        // Arrange & Act
        const { container } = await render(ViewCubeToolboxComponent)

        // Assert
        expect(container.querySelectorAll("cc-toolbox-center-map-button").length).toBe(1)
        expect(container.querySelectorAll("cc-toolbox-screenshot-button").length).toBe(1)
        expect(container.querySelectorAll("cc-toolbox-presentation-mode-button").length).toBe(1)
    })
})
