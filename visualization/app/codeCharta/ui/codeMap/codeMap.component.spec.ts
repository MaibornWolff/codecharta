import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { GlobalSettingsFacade } from "../../features/globalSettings/facade"
import { CodeMapComponent } from "./codeMap.component"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { Store } from "@ngrx/store"
import { NO_ERRORS_SCHEMA } from "@angular/core"

describe("CodeMapComponent", () => {
    let mockedThreeViewService: ThreeViewerService
    let mockedCodeMapMouseEventService: CodeMapMouseEventService
    let mockedSharpnessModeSelector$: BehaviorSubject<string>
    let component: CodeMapComponent
    let fixture: any

    beforeEach(() => {
        mockedThreeViewService = { init: jest.fn(), restart: jest.fn() } as unknown as ThreeViewerService
        mockedCodeMapMouseEventService = { start: jest.fn() } as unknown as CodeMapMouseEventService
        mockedSharpnessModeSelector$ = new BehaviorSubject("High")

        TestBed.configureTestingModule({
            imports: [CodeMapComponent],
            providers: [
                { provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } },
                { provide: Store, useValue: { select: jest.fn().mockReturnValue(new BehaviorSubject(false)) } },
                { provide: ThreeViewerService, useValue: mockedThreeViewService },
                { provide: CodeMapMouseEventService, useValue: mockedCodeMapMouseEventService },
                { provide: GlobalSettingsFacade, useValue: { sharpnessMode$: () => mockedSharpnessModeSelector$ } }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(CodeMapComponent, {
            set: {
                template: `<div id="codeMap"></div>`
            }
        })

        fixture = TestBed.createComponent(CodeMapComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it("should init threeViewerService and start codeMapMouseService after view init", () => {
        component.ngAfterViewInit()
        expect(mockedThreeViewService.init).toHaveBeenCalled()
        expect(mockedCodeMapMouseEventService.start).toHaveBeenCalled()
    })

    it("should restart on sharpnessModeChanges but not on first one as it will get started then", () => {
        jest.clearAllMocks()
        expect(mockedThreeViewService.restart).not.toHaveBeenCalled()
        expect(mockedCodeMapMouseEventService.start).not.toHaveBeenCalled()

        mockedSharpnessModeSelector$.next("Low")
        TestBed.flushEffects()
        expect(mockedThreeViewService.restart).toHaveBeenCalled()
        expect(mockedCodeMapMouseEventService.start).toHaveBeenCalled()
    })
})
