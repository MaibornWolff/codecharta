import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, BlacklistType, CcState } from "../../codeCharta.model"
import { createBlacklistItemSelector } from "../ribbonBar/searchPanel/blacklistPanel/createBlacklistItemSelector"
import { blacklistExtensionsPattern } from "../../state/effects/blacklistExtension/blacklistExtension.effect"
import { CategorizedMetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "./selectors/fileExtensionCalculator"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { removeBlacklistItem, removeBlacklistItems } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { map, Observable } from "rxjs"

export function addPrefixWildcard(extension: string) {
    return `*.${extension}`
}

@Injectable({
    providedIn: "root"
})
export class BlackListExtensionService {
    readonly metricDistribution$ = this.store.select(metricDistributionSelector)
    private metricDistribution: CategorizedMetricDistribution
    private readonly flattenedItems = new Map<string, BlacklistItem>()
    readonly flattenedItems$ = this.store.select(createBlacklistItemSelector("flatten"))

    constructor(private readonly store: Store<CcState>) {
        this.metricDistribution$?.subscribe(metricDistribution => {
            this.metricDistribution = metricDistribution
        })

        this.flattenedItems$?.subscribe(flattenedItems => {
            this.flattenedItems.clear()

            for (const flattenedItem of flattenedItems) {
                this.flattenedItems.set(flattenedItem.path, flattenedItem)
            }
        })
    }

    flatten(fileExtension: string) {
        this.addExtensionToBlackList(fileExtension, "flatten")
    }

    exclude(fileExtension: string) {
        this.addExtensionToBlackList(fileExtension, "exclude")
    }

    show(fileExtension: string) {
        if (fileExtension === OTHER_EXTENSION) {
            const flattenedItemsToShow = this.metricDistribution.others.map(it =>
                this.flattenedItems.get(addPrefixWildcard(it.fileExtension))
            )
            this.store.dispatch(removeBlacklistItems({ items: flattenedItemsToShow }))
        } else {
            const flattenedItemToShow = this.flattenedItems.get(addPrefixWildcard(fileExtension))
            this.store.dispatch(removeBlacklistItem({ item: flattenedItemToShow }))
        }
    }

    getIsFlattenedByFileExtension(fileExtension: string): Observable<boolean> {
        return this.flattenedItems$.pipe(
            map(items => {
                const extension = addPrefixWildcard(fileExtension)
                const flattenedFileExtensions = items.map(item => item.path)
                if (fileExtension === OTHER_EXTENSION) {
                    return this.metricDistribution.others
                        .map(it => addPrefixWildcard(it.fileExtension))
                        .some(it => flattenedFileExtensions.includes(it))
                }
                return flattenedFileExtensions.includes(extension)
            })
        )
    }

    private addExtensionToBlackList(fileExtension: string, type: BlacklistType) {
        if (fileExtension === OTHER_EXTENSION) {
            const fileExtensionsToExclude = this.metricDistribution.others
                .filter(it => it.fileExtension !== NO_EXTENSION)
                .map(it => addPrefixWildcard(it.fileExtension))
            this.store.dispatch(blacklistExtensionsPattern(type, ...fileExtensionsToExclude))
        } else {
            this.store.dispatch(blacklistExtensionsPattern(type, addPrefixWildcard(fileExtension)))
        }
    }
}
