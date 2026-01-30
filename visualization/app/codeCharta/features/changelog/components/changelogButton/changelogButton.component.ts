import { Component, viewChild } from "@angular/core"
import { ChangelogDialogComponent } from "../changelogDialog/changelogDialog.component"
import { ActionIconComponent } from "../../../../ui/actionIcon/actionIcon.component"

@Component({
    selector: "cc-changelog-button",
    templateUrl: "./changelogButton.component.html",
    imports: [ChangelogDialogComponent, ActionIconComponent]
})
export class ChangelogButtonComponent {
    dialog = viewChild.required<ChangelogDialogComponent>("changelogDialog")

    showChangelog() {
        this.dialog().open()
    }
}
