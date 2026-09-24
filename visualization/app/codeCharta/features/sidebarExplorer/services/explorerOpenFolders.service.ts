import { Injectable, signal } from "@angular/core"

/** The tree is destroyed whenever the explorer shows another mode or collapses, so which folders are
 * open lives here, next to the view, rather than in the tree levels. */
@Injectable()
export class ExplorerOpenFoldersService {
    private readonly openStateByPath = signal<ReadonlyMap<string, boolean>>(new Map())

    isOpen(path: string, openByDefault: boolean): boolean {
        return this.openStateByPath().get(path) ?? openByDefault
    }

    setOpen(path: string, isOpen: boolean): void {
        this.openStateByPath.update(openStateByPath => new Map(openStateByPath).set(path, isOpen))
    }
}
