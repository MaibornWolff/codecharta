import { TestBed } from "@angular/core/testing"
import { NavigationEnd, Router } from "@angular/router"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Subject } from "rxjs"
import { DependencyLevelData, FileSelectionState, FileState } from "../../../../model/codeCharta.model"
import { routeLinks } from "../../../../routing/routePaths"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ToastService } from "../../../shared/facade"
import { RedirectAwayFromDependencyViewEffect } from "./redirectAwayFromDependencyView.effect"

describe("RedirectAwayFromDependencyViewEffect", () => {
    let store: MockStore
    let router: { url: string; events: Subject<unknown>; navigateByUrl: jest.Mock }
    let toastService: { show: jest.Mock }

    function setup(currentUrl: string) {
        router = { url: currentUrl, events: new Subject(), navigateByUrl: jest.fn() }
        toastService = { show: jest.fn() }
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RedirectAwayFromDependencyViewEffect])],
            providers: [
                { provide: Router, useValue: router },
                { provide: ToastService, useValue: toastService },
                provideMockStore({ initialState: defaultState })
            ]
        })
        store = TestBed.inject(MockStore)
    }

    function loadFile(dependencyLevels: DependencyLevelData, dependencyViewEnabled = true) {
        const files = [
            {
                file: { fileMeta: { fileChecksum: "checksum" }, settings: { fileSettings: { dependencyLevels } } },
                selectedAs: FileSelectionState.Partial
            }
        ] as FileState[]
        store.setState({ ...defaultState, preferences: { ...defaultState.preferences, dependencyViewEnabled }, files })
    }

    function navigateTo(url: string) {
        router.url = url
        router.events.next(new NavigationEnd(1, url, url))
    }

    function settle(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0))
    }

    it("should send the reader to the map with a toast when a file without dependency data is loaded on the dependency view", async () => {
        // Arrange
        setup(routeLinks.dependencies)

        // Act
        loadFile({})
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
        expect(toastService.show).toHaveBeenCalledWith("This file has no dependency data — switched to the map view.")
    })

    it("should send the reader to the map when they open the dependency view for a file without dependency data", async () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile({})
        await settle()

        // Act
        navigateTo(routeLinks.dependencies)
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should stay on the dependency view when the file carries dependency levels", async () => {
        // Arrange
        setup(routeLinks.dependencies)

        // Act
        loadFile({ "/root/a.ts": 0 })
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should send the reader to the map with a toast naming the setting while the dependency view is switched off", async () => {
        // Arrange
        setup(routeLinks.dependencies)

        // Act
        loadFile({ "/root/a.ts": 0 }, false)
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
        expect(toastService.show).toHaveBeenCalledWith("The dependency view is experimental — switch it on in the Global Configuration.")
    })

    it("should wait for the files before reading the setting, since the saved setting is restored before them", async () => {
        // Arrange
        setup(routeLinks.dependencies)

        // Act
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should leave other views alone", async () => {
        // Arrange
        setup(routeLinks.metrics)

        // Act
        loadFile({}, false)
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })
})
