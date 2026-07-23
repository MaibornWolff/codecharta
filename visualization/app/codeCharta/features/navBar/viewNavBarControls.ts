import { ViewId } from "../../routing/routePaths"

export type NavBarControlId = "modeToggle" | "print3D" | "settings"

export const viewNavBarControls: Record<ViewId, ReadonlySet<NavBarControlId>> = {
    metrics: new Set<NavBarControlId>(["modeToggle", "print3D", "settings"]),
    domain: new Set<NavBarControlId>(["settings"])
}
