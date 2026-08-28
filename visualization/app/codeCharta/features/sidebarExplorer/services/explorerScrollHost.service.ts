import { Injectable, signal } from "@angular/core"

@Injectable()
export class ExplorerScrollHostService {
    private readonly scrollHost = signal<HTMLElement | null>(null)

    readonly element = this.scrollHost.asReadonly()

    register(element: HTMLElement | null) {
        this.scrollHost.set(element)
    }
}
