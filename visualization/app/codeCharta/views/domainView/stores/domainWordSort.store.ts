import { Injectable } from "@angular/core"
import { BehaviorSubject, map } from "rxjs"
import { WordSorting, WordSortingOption } from "../../../features/domainWordOccurrences/facade"
import { ExplorerSort } from "../../../features/sidebarExplorer/facade"

// A picked option starts in the direction it reads best in: A to Z for names, the biggest number first.
const ASCENDING_BY_OPTION: Record<WordSortingOption, boolean> = {
    [WordSortingOption.OCCURRENCES]: false,
    [WordSortingOption.NAME]: true,
    [WordSortingOption.RELEVANCE]: false
}

const MOST_FREQUENT_FIRST: WordSorting = {
    option: WordSortingOption.OCCURRENCES,
    ascending: ASCENDING_BY_OPTION[WordSortingOption.OCCURRENCES]
}

/** How the explorer's sort control orders the word list, while the explorer browses words. */
@Injectable()
export class DomainWordSortStore implements ExplorerSort<WordSortingOption> {
    private readonly sortingSubject = new BehaviorSubject<WordSorting>(MOST_FREQUENT_FIRST)

    readonly options = Object.values(WordSortingOption)
    readonly sorting$ = this.sortingSubject.asObservable()
    readonly option$ = this.sorting$.pipe(map(({ option }) => option))
    readonly ascending$ = this.sorting$.pipe(map(({ ascending }) => ascending))

    setOption(option: WordSortingOption): void {
        this.sortingSubject.next({ option, ascending: ASCENDING_BY_OPTION[option] })
    }

    toggleAscending(): void {
        const { ascending } = this.sortingSubject.value
        this.sortingSubject.next({ ...this.sortingSubject.value, ascending: !ascending })
    }
}
