import { Directive, output } from "@angular/core"

/** Tells whether the pointer or the keyboard focus rests on the element, so that what the keyboard reaches is
 * pointed at as what the mouse does. */
@Directive({
    selector: "[ccPointing]",
    host: {
        "(mouseenter)": "pointingChange.emit(true)",
        "(mouseleave)": "pointingChange.emit(false)",
        "(focusin)": "pointingChange.emit(true)",
        "(focusout)": "pointingChange.emit(false)"
    }
})
export class PointingDirective {
    readonly pointingChange = output<boolean>()
}
