import { ChangeDetectionStrategy, Component, viewChild, ElementRef } from "@angular/core"
import { LabelSettingsPanelComponent } from "../labelSettingsPanel/labelSettingsPanel.component"
import { RibbonBarMenuButtonComponent } from "../../../../ui/ribbonBar/ribbonBarMenuButton/ribbonBarMenuButton.component"

@Component({
    selector: "cc-label-settings-button",
    templateUrl: "./labelSettingsButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LabelSettingsPanelComponent, RibbonBarMenuButtonComponent]
})
export class LabelSettingsButtonComponent {
    readonly popover = viewChild.required<ElementRef<HTMLElement>>("popover")

    togglePopover() {
        this.popover().nativeElement.togglePopover()
    }
}
