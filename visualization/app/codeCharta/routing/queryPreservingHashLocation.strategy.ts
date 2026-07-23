import { APP_BASE_HREF, HashLocationStrategy, PlatformLocation } from "@angular/common"
import { Injectable, inject } from "@angular/core"

@Injectable()
export class QueryPreservingHashLocationStrategy extends HashLocationStrategy {
    private readonly platformLocation = inject(PlatformLocation)

    constructor() {
        super(inject(PlatformLocation), inject(APP_BASE_HREF, { optional: true }) ?? undefined)
    }

    override prepareExternalUrl(internal: string): string {
        const urlWithCurrentQueryString = new URL(this.platformLocation.href)
        urlWithCurrentQueryString.hash = super.prepareExternalUrl(internal)
        return urlWithCurrentQueryString.toString()
    }
}
