import { Injectable, inject } from "@angular/core"
import { NavigationStart, Router } from "@angular/router"
import { createEffect } from "@ngrx/effects"
import { filter, tap } from "rxjs"

/** The router places the active view right after its outlet. */
const OPEN_DIALOGS_OF_ACTIVE_VIEW = "router-outlet + * dialog[open]"

/** A kept-alive view leaves the page with its dialogs, which drops them from the top layer: re-attached, they would
 * still be open but drawn as ordinary elements under the side panels. */
@Injectable()
export class CloseDialogsOfLeftViewEffect {
    private readonly router = inject(Router)

    closeDialogsOfLeftView$ = createEffect(
        () =>
            this.router.events.pipe(
                filter(event => event instanceof NavigationStart),
                tap(() => {
                    for (const dialog of document.querySelectorAll<HTMLDialogElement>(OPEN_DIALOGS_OF_ACTIVE_VIEW)) {
                        dialog.close()
                    }
                })
            ),
        { dispatch: false }
    )
}
