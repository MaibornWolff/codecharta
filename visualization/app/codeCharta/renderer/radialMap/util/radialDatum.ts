import { describeRadialFolderValue } from "../../../util/radialFolderValues"
import { RadialColoring, RadialFolderColoring } from "./radialColor"
import { RadialNode } from "./radialTree"

export const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 2 })

export interface RadialDatum {
    name: string
    value: number
    displayName: string
    colorValue: number | undefined
    folderValueText: string | undefined
    isCentre: boolean
    isFile: boolean
}

export function describeNode(node: RadialNode, coloring: RadialColoring): Omit<RadialDatum, "isCentre"> {
    return {
        name: node.path,
        value: node.area,
        displayName: node.name,
        colorValue: node.colorValue,
        folderValueText: folderValueText(node, coloring.folders),
        isFile: node.isFile
    }
}

function folderValueText({ path, isFile }: Pick<RadialNode, "path" | "isFile">, folders: RadialFolderColoring): string | undefined {
    const folderValue = isFile ? undefined : folders.values.get(path)
    if (folderValue === undefined) {
        return undefined
    }
    return `${describeRadialFolderValue(folders.value).label} ${numberFormatter.format(folderValue)}`
}
