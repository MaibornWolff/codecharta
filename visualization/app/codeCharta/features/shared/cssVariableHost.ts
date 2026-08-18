import { ElementRef, InjectionToken, inject, Provider } from "@angular/core"

// Views are kept alive on route switches (KeepAliveRouteReuseStrategy), so a detached view never runs
// its cleanup. Publishing onto the view host instead of documentElement lets the detached DOM subtree
// carry its variables out of the document, so one view cannot inherit the other's bar heights.
export const CSS_VARIABLE_HOST = new InjectionToken<HTMLElement>("CSS_VARIABLE_HOST", {
    providedIn: "root",
    factory: () => document.documentElement
})

export const provideViewScopedCssVariables = (): Provider => ({
    provide: CSS_VARIABLE_HOST,
    useFactory: () => inject(ElementRef).nativeElement as HTMLElement
})
