import { Injector } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { EXPLORER_SEARCH, ExplorerSearch, provideExplorerSearch } from "../../../features/sidebarExplorer/facade"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { METRICS_EXPLORER_SEARCH } from "../../metricsView/explorer/metricsExplorerSearch"
import { DOMAIN_EXPLORER_SEARCH } from "./domainExplorerSearch"

describe("DOMAIN_EXPLORER_SEARCH", () => {
    let domainSearch: ExplorerSearch
    let metricsSearch: ExplorerSearch

    const searchOf = (config: typeof DOMAIN_EXPLORER_SEARCH) =>
        Injector.create({ providers: [provideExplorerSearch(config)], parent: TestBed.inject(Injector) }).get(EXPLORER_SEARCH)

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        domainSearch = searchOf(DOMAIN_EXPLORER_SEARCH)
        metricsSearch = searchOf(METRICS_EXPLORER_SEARCH)
    })

    it("should stream the domain view's own pattern", async () => {
        // Arrange & Act
        domainSearch.setPattern("*.kt")

        // Assert
        expect(await firstValueFrom(domainSearch.pattern$)).toBe("*.kt")
        expect(await firstValueFrom(domainSearch.isPatternEmpty$)).toBe(false)
    })

    it("should leave the map view's pattern untouched when the domain view searches", async () => {
        // Arrange & Act
        domainSearch.setPattern("*.kt")

        // Assert
        expect(await firstValueFrom(metricsSearch.pattern$)).toBe("")
        expect(await firstValueFrom(metricsSearch.isPatternEmpty$)).toBe(true)
    })

    it("should not adopt a pattern the map view searched for", async () => {
        // Arrange & Act
        metricsSearch.setPattern("*.java")

        // Assert
        expect(await firstValueFrom(domainSearch.pattern$)).toBe("")
        expect(await firstValueFrom(domainSearch.isPatternEmpty$)).toBe(true)
    })

    it("should clear only its own pattern on reset", async () => {
        // Arrange
        domainSearch.setPattern("*.kt")
        metricsSearch.setPattern("*.java")

        // Act
        domainSearch.resetPattern()

        // Assert
        expect(await firstValueFrom(domainSearch.pattern$)).toBe("")
        expect(await firstValueFrom(metricsSearch.pattern$)).toBe("*.java")
    })
})
