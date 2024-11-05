import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from "@angular/core"

@Directive({
    selector: "[ccRiskProfileBar]",
    standalone: true
})
export class RiskProfileBarDirective implements OnChanges {
    @Input() ccRiskProfileBar = 0

    constructor(private element: ElementRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.ccRiskProfileBar) {
            this.element.nativeElement.style.display = this.ccRiskProfileBar > 0 ? "flex" : "none"
            this.element.nativeElement.style.width = `${this.ccRiskProfileBar}%`
            this.element.nativeElement.style.color = this.ccRiskProfileBar > 5 ? "black" : "rgba(0,0,0,0)"
        }
    }
}
