import { setAttributeTypes, setAttributeDescriptors } from "../../../lenses/metrics/metricsLens.load.facade"
import { setBlacklist, addBlacklistItem, addBlacklistItems, removeBlacklistItem } from "../../../sharedView/sharedView.facade"
import { setEdges, addEdge, removeEdge } from "./edges/edges.actions"
import { setMarkedPackages, markPackages, unmarkPackage } from "./markedPackages/markedPackages.actions"

export const fileSettingsActions = [
    setMarkedPackages,
    markPackages,
    unmarkPackage,
    setEdges,
    addEdge,
    removeEdge,
    setAttributeTypes,
    setAttributeDescriptors,
    setBlacklist,
    addBlacklistItem,
    addBlacklistItems,
    removeBlacklistItem
]
