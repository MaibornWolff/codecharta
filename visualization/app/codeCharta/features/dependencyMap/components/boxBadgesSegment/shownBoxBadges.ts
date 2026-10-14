import { DEPENDENCY_BOX_BADGES, DependencyBoxBadge } from "../../../../model/dependencyGraph.model"

type BoxBadges = readonly DependencyBoxBadge[]

interface OfferedBadge {
    mark: DependencyBoxBadge
    label: string
}

export function nameOfShownBoxBadges(shown: BoxBadges, offered: readonly OfferedBadge[]): string {
    const shownAndOffered = offered.filter(badge => shown.includes(badge.mark))
    if (shownAndOffered.length === offered.length) {
        return "All"
    }
    if (shownAndOffered.length === 0) {
        return "None"
    }
    return shownAndOffered.map(badge => badge.label).join(", ")
}

export function withBoxBadge(shown: BoxBadges, badge: DependencyBoxBadge, isShown: boolean): DependencyBoxBadge[] {
    return DEPENDENCY_BOX_BADGES.filter(each => (each === badge ? isShown : shown.includes(each)))
}

export function invertedBoxBadges(shown: BoxBadges): DependencyBoxBadge[] {
    return DEPENDENCY_BOX_BADGES.filter(badge => !shown.includes(badge))
}
