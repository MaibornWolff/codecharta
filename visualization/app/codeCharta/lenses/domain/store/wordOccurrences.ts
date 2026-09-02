import { CodeMapNode, DomainLensData } from "../../../model/codeCharta.model"
import { isLeaf } from "../../../util/codeMapHelper"

export interface WordOccurrenceNode {
    path: string
    name: string
    isFolder: boolean
    count: number
    share: number
    children: WordOccurrenceNode[]
}

export function buildWordOccurrenceTree(
    root: CodeMapNode | undefined,
    words: DomainLensData,
    scopePath: string,
    word: string
): WordOccurrenceNode | null {
    const scopeNode = root && findNode(root, scopePath)
    if (!scopeNode) {
        return null
    }
    const counted = countOccurrences(scopeNode, words, word)
    return toOccurrenceNode(counted, counted.count)
}

interface CountedNode {
    node: CodeMapNode
    count: number
    children: CountedNode[]
}

/** A producer may record a folder's aggregate, only its files, or both. Falling back to the children
 * keeps a file-only lens from showing empty folders, while a recorded aggregate stays authoritative. */
function countOccurrences(node: CodeMapNode, words: DomainLensData, word: string): CountedNode {
    const children = (node.children ?? []).map(child => countOccurrences(child, words, word))
    const recordedCount = frequencyOf(words[node.path], word)
    const count = recordedCount > 0 ? recordedCount : sumOf(children)
    return { node, count, children }
}

function frequencyOf(words: DomainLensData[string] | undefined, word: string): number {
    return words?.find(({ text }) => text === word)?.frequency ?? 0
}

function sumOf(children: CountedNode[]): number {
    return children.reduce((total, child) => total + child.count, 0)
}

function toOccurrenceNode({ node, count, children }: CountedNode, scopeCount: number): WordOccurrenceNode {
    return {
        path: node.path,
        name: node.name,
        isFolder: !isLeaf(node),
        count,
        share: scopeCount > 0 ? count / scopeCount : 0,
        children: children
            .filter(child => child.count > 0)
            .sort(byDescendingCountThenName)
            .map(child => toOccurrenceNode(child, scopeCount))
    }
}

function byDescendingCountThenName(one: CountedNode, other: CountedNode): number {
    return other.count - one.count || one.node.name.localeCompare(other.node.name)
}

function findNode(node: CodeMapNode, path: string): CodeMapNode | undefined {
    if (node.path === path) {
        return node
    }
    for (const child of node.children ?? []) {
        const match = findNode(child, path)
        if (match) {
            return match
        }
    }
    return undefined
}
