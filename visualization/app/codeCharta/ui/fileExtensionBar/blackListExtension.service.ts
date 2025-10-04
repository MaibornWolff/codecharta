import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, BlacklistType, CcState, CodeMapNode, NodeType } from "../../codeCharta.model"
import { createBlacklistItemSelector } from "../ribbonBar/searchPanel/blacklistPanel/createBlacklistItemSelector"
import { blacklistExtensionsPattern } from "../../state/effects/blacklistExtension/blacklistExtension.effect"
import { CategorizedMetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "./selectors/fileExtensionCalculator"
import { hoveredNodeMetricDistributionSelector } from "./selectors/hoveredNodeMetricDistribution.selector"
import { removeBlacklistItems } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { combineLatest, map, Observable, take } from "rxjs"
import { hoveredNodeSelector } from "../../state/selectors/hoveredNode.selector"
import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"

export function addPrefixWildcard(extension: string) {
    return `*.${extension}`
}

export function expandExtensions(fileExtension: string, metricDistribution: CategorizedMetricDistribution): string[] {
    if (fileExtension === OTHER_EXTENSION) {
        return metricDistribution.others.filter(it => it.fileExtension !== NO_EXTENSION).map(it => it.fileExtension)
    }
    return [fileExtension]
}

export function buildGlobPatterns(
    fileExtension: string,
    metricDistribution: CategorizedMetricDistribution,
    contextNode?: CodeMapNode
): string[] {
    const extensions = expandExtensions(fileExtension, metricDistribution)
    return extensions.map(ext => {
        const basePattern = addPrefixWildcard(ext)
        if (contextNode?.type === NodeType.FOLDER) {
            return `${contextNode.path}/**/${basePattern}`
        }
        return basePattern
    })
}

interface MetricDistributionNodeContext {
    distribution: CategorizedMetricDistribution
    node?: CodeMapNode
    flattenedItems: BlacklistItem[]
}

@Injectable({
    providedIn: "root"
})
export class BlackListExtensionService {
    private readonly operationContext$: Observable<MetricDistributionNodeContext> = combineLatest([
        this.store.select(hoveredNodeMetricDistributionSelector),
        this.store.select(hoveredNodeSelector),
        this.store.select(selectedNodeSelector),
        this.store.select(createBlacklistItemSelector("flatten"))
    ]).pipe(
        map(([distribution, hoveredNode, selectedNode, flattenedItems]) => ({
            distribution,
            node: hoveredNode || selectedNode,
            flattenedItems
        }))
    )

    constructor(private readonly store: Store<CcState>) {}

    show(fileExtension: string) {
        this.operationContext$.pipe(take(1)).subscribe(ctx => {
            const extensionPatterns = buildGlobPatterns(fileExtension, ctx.distribution, ctx.node)
            const flattenedItemsMap = this.createFlattenedItemsMap(ctx.flattenedItems)
            const itemsToRemove = extensionPatterns.map(pattern => flattenedItemsMap.get(pattern))

            this.store.dispatch(removeBlacklistItems({ items: itemsToRemove }))
        })
    }

    exclude(fileExtension: string) {
        this.operationContext$.pipe(take(1)).subscribe(ctx => {
            const extensionPatterns = buildGlobPatterns(fileExtension, ctx.distribution, ctx.node)
            this.store.dispatch(blacklistExtensionsPattern("exclude", ...extensionPatterns))
        })
    }

    flatten(fileExtension: string) {
        this.operationContext$.pipe(take(1)).subscribe(ctx => {
            const extensionPatterns = buildGlobPatterns(fileExtension, ctx.distribution, ctx.node)
            this.store.dispatch(blacklistExtensionsPattern("flatten", ...extensionPatterns))
        })
    }

    getIsFlattenedByFileExtension(fileExtension: string): Observable<boolean> {
        return this.operationContext$.pipe(
            map(ctx => {
                const extensionPatterns = buildGlobPatterns(fileExtension, ctx.distribution, ctx.node)
                return extensionPatterns.every(pattern => ctx.flattenedItems.some(item => item.path === pattern))
            })
        )
    }

    private createFlattenedItemsMap(flattenedItems: BlacklistItem[]): Map<string, BlacklistItem> {
        const map = new Map<string, BlacklistItem>()
        for (const item of flattenedItems) {
            map.set(item.path, item)
        }
        return map
    }
}
