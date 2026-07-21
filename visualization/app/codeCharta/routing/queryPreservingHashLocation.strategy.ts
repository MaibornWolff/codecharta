import { APP_BASE_HREF, HashLocationStrategy, PlatformLocation } from "@angular/common"
import { Injectable, inject } from "@angular/core"

/**
 * A `HashLocationStrategy` that writes an ABSOLUTE url, so the router can never destroy the `?file=…`
 * deep link.
 *
 * Angular's `HashLocationStrategy.prepareExternalUrl` hardcodes a leading "#", so every history write it
 * makes is a FRAGMENT-ONLY RELATIVE url ("#/"). Per the HTML spec, `history.replaceState` resolves a
 * relative url against the document's API base url (`document.baseURI`) — NOT against the document url.
 * `app/index.html` carries `<base href="./" />`, and resolving "./" against
 * "…/index.html?file=x&area=functions" yields "…/" — the query string is absent from `baseURI`. So the
 * router's very first navigation rewrote the location to "…/#/" and silently dropped every query
 * parameter, making `QueryParamsService.hasFile()` false and booting the sample files with the default
 * metrics instead of the deep-linked ones.
 *
 * Resolving that fragment against `window.location.href` ourselves makes the url absolute, so base-url
 * resolution cannot apply and pathname + search always survive. This is what makes the ownership split
 * documented on `QueryParamsService` actually true: the router only ever rewrites the FRAGMENT, that
 * service only ever rewrites the QUERY STRING.
 *
 * The absolutization lives in `prepareExternalUrl` rather than only in the two history writers because
 * the SAME base-uri resolution applies to anchors: `routerLink` renders `prepareExternalUrl`'s result
 * into `href`, so a bare "#/domain" makes ctrl+click, middle-click and "copy link address" on the view
 * switcher navigate to "…/#/domain" without the `?file=…` deep link. Left-clicking hides this, because
 * `RouterLink` intercepts it and goes through the history writers instead.
 */
@Injectable()
export class QueryPreservingHashLocationStrategy extends HashLocationStrategy {
    private readonly platformLocation = inject(PlatformLocation)

    constructor() {
        super(inject(PlatformLocation), inject(APP_BASE_HREF, { optional: true }) ?? undefined)
    }

    /** Resolves the fragment the base strategy would have produced against the CURRENT href. */
    override prepareExternalUrl(internal: string): string {
        const url = new URL(this.platformLocation.href)
        url.hash = super.prepareExternalUrl(internal)
        return url.toString()
    }
}
