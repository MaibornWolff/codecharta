import { inject } from "@angular/core"
import { CanActivateFn } from "@angular/router"
import { viewIdForRoutePath } from "./routePaths"
import { ViewSwitchProgressStore } from "./viewSwitchProgress.store"

/** A view is built synchronously while the router activates it, so a spinner raised any later would never
 * reach the screen before the build blocks it. */
export const showSpinnerBeforeBuildingView: CanActivateFn = route => {
    const view = viewIdForRoutePath(route.routeConfig?.path ?? "")
    return inject(ViewSwitchProgressStore).announceSwitchTo(view) ? afterSpinnerHasBeenPainted() : true
}

// The first frame paints the spinner, the second one only starts once that paint is on screen.
function afterSpinnerHasBeenPainted(): Promise<boolean> {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))
}
