export const routePaths = {
    metrics: "",
    domain: "domain"
} as const

const absoluteLinkOf = (routePath: string) => `/${routePath}`

export const routeLinks = {
    metrics: absoluteLinkOf(routePaths.metrics),
    domain: absoluteLinkOf(routePaths.domain)
} as const

export type ViewId = keyof typeof routePaths

export const VIEW_IDS = Object.keys(routePaths) as readonly ViewId[]

const VIEW_ID_FOR_UNRECOGNIZED_URL: ViewId = "metrics"

export function viewIdForLink(url: string): ViewId {
    const linkWithoutQueryString = url.split("?")[0]
    const matchedViewId = VIEW_IDS.find(viewId => routeLinks[viewId] === linkWithoutQueryString)
    return matchedViewId ?? VIEW_ID_FOR_UNRECOGNIZED_URL
}
