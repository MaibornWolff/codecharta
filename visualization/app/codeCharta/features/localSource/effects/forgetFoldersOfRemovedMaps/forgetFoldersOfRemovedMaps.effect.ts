import { Injectable, inject } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { concatMap } from "rxjs"
import { removeFiles } from "../../../../stores/fileStore/fileStore.facade"
import { LocalSourceService } from "../../services/localSource.service"

@Injectable()
export class ForgetFoldersOfRemovedMapsEffect {
    private readonly actions$ = inject(Actions)
    private readonly localSource = inject(LocalSourceService)

    readonly forgetFolders$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(removeFiles),
                concatMap(({ fileNames }) => this.localSource.forgetFoldersOf(fileNames))
            ),
        { dispatch: false }
    )
}
