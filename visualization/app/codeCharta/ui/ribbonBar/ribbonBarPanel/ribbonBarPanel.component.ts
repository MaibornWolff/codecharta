import { Component, ContentChild, HostBinding, Input } from "@angular/core"
import { RibbonBarPanelExpandableContentComponent } from "./ribbonBarPanelExpandableComponent";

@Component({
    selector: "cc-ribbon-bar-panel",
    templateUrl: "./ribbonBarPanel.component.html",
    styleUrl: "./ribbonBarPanel.component.scss"
})
export class RibbonBarPanelComponent {
    @Input() title?: string

    @HostBinding('class.separator')
    @Input()
    separator = false

    @HostBinding('class.expandable')
    @ContentChild(RibbonBarPanelExpandableContentComponent)
    expandableContent?: RibbonBarPanelExpandableContentComponent;
    
    @HostBinding('class.expanded')
    expanded = false;

    onSectionTitleClick(): void {
        this.expanded = !this.expanded;
    }
}
