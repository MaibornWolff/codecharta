/**
 * The app's routing topology in ONE place. The router's route definitions, the links that navigate
 * between the views and the code that branches on or navigates away from the active view all derive
 * their paths from here, so adding or renaming a view is a single-file change.
 *
 * Two forms are needed because Angular spells the same route two ways: `routePaths` is the route-CONFIG
 * form (no leading slash, "" for the default route), `routeLinks` is the absolute URL form that routerLink
 * navigates to and that `Router#url` reports. Note that `withHashLocation` puts these paths in the URL
 * FRAGMENT ("#/domain"), so they are never a pathname the server sees.
 */
export const routePaths = {
    metrics: "",
    domain: "domain"
} as const

const absoluteLinkOf = (routePath: string) => `/${routePath}`

export const routeLinks = {
    metrics: absoluteLinkOf(routePaths.metrics),
    domain: absoluteLinkOf(routePaths.domain)
} as const

/** The routed views. Derived from `routePaths` so adding a view really is a single-file change. */
export type ViewId = keyof typeof routePaths

export const VIEW_IDS = Object.keys(routePaths) as readonly ViewId[]

/** Where an unrecognized URL is treated as being — the router sends it to the default route anyway. */
const DEFAULT_VIEW_ID: ViewId = "metrics"

/** The view a router URL belongs to, or the default view when the URL matches no route. */
export function viewIdForLink(url: string): ViewId {
    const link = url.split("?")[0]
    const matched = VIEW_IDS.find(viewId => routeLinks[viewId] === link)
    return matched ?? DEFAULT_VIEW_ID
}
