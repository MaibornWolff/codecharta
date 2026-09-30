import { DEPENDENCY_EDGE_TYPES, DependencyEdgeType } from "../../../../model/dependencyGraph.model"
import { EDGE_LEGEND } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

type EdgeTypes = readonly DependencyEdgeType[]

export function nameOfShownEdgeTypes(shown: EdgeTypes, carried: EdgeTypes): string {
    const shownAndCarried = carried.filter(type => shown.includes(type))
    if (shownAndCarried.length === carried.length) {
        return "All"
    }
    if (shownAndCarried.length === 0) {
        return "None"
    }
    return EDGE_LEGEND.filter(entry => shownAndCarried.includes(entry.type))
        .map(entry => entry.label)
        .join(", ")
}

export function withAllEdgeTypes(shown: EdgeTypes, added: EdgeTypes): DependencyEdgeType[] {
    return DEPENDENCY_EDGE_TYPES.filter(type => shown.includes(type) || added.includes(type))
}

export function withoutEdgeTypes(shown: EdgeTypes, removed: EdgeTypes): DependencyEdgeType[] {
    return DEPENDENCY_EDGE_TYPES.filter(type => shown.includes(type) && !removed.includes(type))
}

/** Flips the carried types only; the others keep their state for when an edge metric carries them again. */
export function invertedEdgeTypes(shown: EdgeTypes, carried: EdgeTypes): DependencyEdgeType[] {
    return DEPENDENCY_EDGE_TYPES.filter(type => shown.includes(type) !== carried.includes(type))
}
