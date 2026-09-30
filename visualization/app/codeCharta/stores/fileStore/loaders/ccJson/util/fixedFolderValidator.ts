import { ExportCCFile } from "../../../../../model/codeCharta.api.model"
import { CodeMapNode, FixedPosition } from "../../../../../model/codeCharta.model"
import { getAsApiVersion } from "./apiVersion"
import { ERROR_MESSAGES } from "./fileValidationMessages"

export function validateFixedFolders(file: ExportCCFile, childNodes: CodeMapNode[] = file.nodes[0].children) {
    const errors: string[] = []
    const notFixed: string[] = []
    const outOfBounds: string[] = []
    const intersections: Set<string> = new Set()

    checkChildNodes(childNodes, notFixed, file, errors, outOfBounds, intersections)

    if (notFixed.length > 0 && notFixed.length !== childNodes.length) {
        errors.push(`${ERROR_MESSAGES.notAllFoldersAreFixed} Found: ${notFixed.join(", ")}`)
    }

    if (outOfBounds.length > 0) {
        errors.push(`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: ${outOfBounds.join(", ")}`)
    }

    if (intersections.size > 0) {
        errors.push(`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: ${[...intersections].join(", ")}`)
    }

    for (const node of childNodes) {
        if (node.children) {
            errors.push(...validateFixedFolders(file, node.children))
        }
    }
    return errors
}

function checkChildNodes(
    childNodes: CodeMapNode[],
    notFixed: string[],
    file: ExportCCFile,
    errors: string[],
    outOfBounds: string[],
    intersections: Set<string>
) {
    for (const node of childNodes) {
        if (node.fixedPosition === undefined) {
            notFixed.push(`${node.name}`)
        } else {
            const apiVersion = getAsApiVersion(file.apiVersion)
            if (apiVersion.major < 1 || (apiVersion.major === 1 && apiVersion.minor < 2)) {
                errors.push(`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: ${file.apiVersion}`)
                return
            }

            if (isOutOfBounds(node)) {
                outOfBounds.push(getFoundFolderMessage(node))
            }

            collectIntersections(node, childNodes, intersections)
        }
    }
}

function collectIntersections(node: CodeMapNode, childNodes: CodeMapNode[], intersections: Set<string>) {
    for (const node2 of childNodes) {
        if (
            node2.fixedPosition !== undefined &&
            node !== node2 &&
            rectanglesIntersect(node.fixedPosition, node2.fixedPosition) &&
            !intersections.has(`${getFoundFolderMessage(node2)} and ${getFoundFolderMessage(node)}`)
        ) {
            intersections.add(`${getFoundFolderMessage(node)} and ${getFoundFolderMessage(node2)}`)
        }
    }
}

function getFoundFolderMessage(node: CodeMapNode) {
    return `${node.name} ${JSON.stringify(node.fixedPosition)}`
}

function rectanglesIntersect(rect1: FixedPosition, rect2: FixedPosition) {
    return (
        isInRectangle(rect1.left, rect1.top, rect2) ||
        isInRectangle(rect1.left, rect1.top + rect1.height, rect2) ||
        isInRectangle(rect1.left + rect1.width, rect1.top, rect2) ||
        isInRectangle(rect1.left + rect1.width, rect1.top + rect1.height, rect2)
    )
}

function isInRectangle(x: number, y: number, rect: FixedPosition) {
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height
}

function isOutOfBounds({ fixedPosition: { left, top, width, height } }: CodeMapNode) {
    return left < 0 || top < 0 || left + width > 100 || top + height > 100 || width < 0 || height < 0
}
