import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { AppModule } from "./app.module"
import { VersionService } from "./codeCharta/services/version/version.service"
import { appReducers } from "./codeCharta/state/store/state.manager"

describe("AppModule", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppModule, StoreModule.forRoot(appReducers)]
        }).compileComponents()
    })

    it("should properly initialize the store", () => {
        const store = TestBed.inject(Store)
        expect(store).toBeTruthy()
    })

    it("should initialize VersionService correctly", () => {
        const versionService = TestBed.inject(VersionService)
        expect(versionService).toBeTruthy()
    })
})
