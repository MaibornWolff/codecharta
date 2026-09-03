import { Injectable } from "@angular/core"
import { BehaviorSubject, map } from "rxjs"
import { ExplorerSearchInput } from "../../../features/sidebarExplorer/facade"

/** What the explorer's search box filters the word list by, while the explorer browses words. */
@Injectable()
export class DomainWordQueryStore implements ExplorerSearchInput {
    private readonly querySubject = new BehaviorSubject<string>("")

    readonly pattern$ = this.querySubject.asObservable()
    readonly isPatternEmpty$ = this.pattern$.pipe(map(query => query.trim().length === 0))

    setPattern(value: string): void {
        this.querySubject.next(value)
    }

    resetPattern(): void {
        this.setPattern("")
    }
}
