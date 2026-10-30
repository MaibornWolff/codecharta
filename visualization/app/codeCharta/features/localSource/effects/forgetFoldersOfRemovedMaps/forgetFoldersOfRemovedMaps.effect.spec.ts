import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Subject } from "rxjs"
import { removeFiles } from "../../../../stores/fileStore/fileStore.facade"
import { LocalSourceService } from "../../services/localSource.service"
import { ForgetFoldersOfRemovedMapsEffect } from "./forgetFoldersOfRemovedMaps.effect"

describe("ForgetFoldersOfRemovedMapsEffect", () => {
    it("should forget the folders of the maps being removed", () => {
        // Arrange
        const actions$ = new Subject<ReturnType<typeof removeFiles>>()
        const forgetFoldersOf = jest.fn().mockResolvedValue(undefined)
        TestBed.configureTestingModule({
            providers: [
                ForgetFoldersOfRemovedMapsEffect,
                provideMockActions(() => actions$),
                { provide: LocalSourceService, useValue: { forgetFoldersOf } }
            ]
        })
        TestBed.inject(ForgetFoldersOfRemovedMapsEffect).forgetFolders$.subscribe()

        // Act
        actions$.next(removeFiles({ fileNames: ["old.cc.json"] }))

        // Assert
        expect(forgetFoldersOf).toHaveBeenCalledWith(["old.cc.json"])
    })
})
