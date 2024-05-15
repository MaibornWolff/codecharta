import { setAttributeDescriptors } from "./attributeDescriptors/attributeDescriptors.action"
import { setAttributeTypes, updateAttributeType } from "./attributeTypes/attributeTypes.actions"
import { setBlacklist, addBlacklistItem, addBlacklistItems, removeBlacklistItem } from "./blacklist/blacklist.actions"
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
    updateAttributeType,
    setAttributeDescriptors,
    setBlacklist,
    addBlacklistItem,
    addBlacklistItems,
    removeBlacklistItem
]
