import { setAttributeTypes, setAttributeDescriptors } from "../../../lenses/metrics/metricsLens.load.facade"
import { setBlacklist, addBlacklistItem, addBlacklistItems, removeBlacklistItem } from "../../../sharedView/sharedView.facade"
import { setMarkedPackages, markPackages, unmarkPackage } from "../../../sharedView/sharedView.facade"
import { setEdges, addEdge, removeEdge } from "./edges/edges.actions"

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
