import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, MarkedPackage } from "../codeCharta.model"
import { FileState } from "../model/files/files"
import { getSelectedFilesSize } from "./fileHelper"

export function getAllNodes(root: CodeMapNode): CodeMapNode[] {
    const filtered = []
    if (root !== undefined) {
        for (const { data } of hierarchy(root)) {
            if (data.type !== "Folder") {
                filtered.push(data)
            }
        }
    }
    return filtered
}

export function getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]): string | void {
    if (!markedPackages) {
        return
    }

    let longestPathParentPackage: MarkedPackage
    for (const markedPackage of markedPackages) {
        if (
            (!longestPathParentPackage || longestPathParentPackage.path.length < markedPackage.path.length) &&
            (node.path.startsWith(`${markedPackage.path}/`) || node.path === markedPackage.path)
        ) {
            longestPathParentPackage = markedPackage
        }
    }

    if (longestPathParentPackage) {
        return longestPathParentPackage.color
    }
}

export type MaybeLeaf = { children?: unknown[] }

export function isLeaf(node: MaybeLeaf) {
    return node.children === undefined || node.children.length === 0
}

export function isAreaValid(node: CodeMapNode, areaMetric: string): boolean {
    return node.deltas?.[areaMetric] < 0 || node.attributes?.[areaMetric] > 0
}

export enum MAP_RESOLUTION_SCALE {
    SMALL_MAP = 1,
    MEDIUM_MAP = 0.5,
    BIG_MAP = 0.25
}

export function getMapResolutionScaleFactor(files: FileState[]) {
    const oneMB = 1024 * 1024
    const totalFilesSizeKB = getSelectedFilesSize(files)

    switch (true) {
        case totalFilesSizeKB >= 7 * oneMB:
            return MAP_RESOLUTION_SCALE.BIG_MAP
        case totalFilesSizeKB >= 2 * oneMB:
            return MAP_RESOLUTION_SCALE.MEDIUM_MAP
        default:
            return MAP_RESOLUTION_SCALE.SMALL_MAP
    }
}
