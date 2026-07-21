import { ViewId } from "../../routing/routePaths"

/** The controls the nav bar can render on its trailing side, in the order they appear. */
export type NavBarControlId = "modeToggle" | "print3D" | "settings"

/**
 * Which trailing nav bar controls each routed view wants.
 *
 * The nav bar sits above the router outlet and therefore outlives every view switch, so without this
 * it renders one fixed set of controls regardless of what is on screen — which is how the map-only
 * "3D Print" and "Explore/Compare" ended up on the domain view. Declaring the controls next to the
 * views inverts that: the nav bar template no longer names any single view, and adding a view is a
 * compile error here until its controls are declared, rather than a silently wrong nav bar.
 *
 * The domain view keeps only Settings: 3D Print exports the code map's geometry, and Explore/Compare
 * toggles delta mode, which the domain view has no semantics for — it merges the word banks of both
 * compared files, and RedirectAwayFromDomainViewEffect ejects you from the view the moment delta mode
 * turns on. Both controls could only ever act on a view the user is not looking at.
 */
export const viewNavBarControls: Record<ViewId, ReadonlySet<NavBarControlId>> = {
    metrics: new Set<NavBarControlId>(["modeToggle", "print3D", "settings"]),
    domain: new Set<NavBarControlId>(["settings"])
}
