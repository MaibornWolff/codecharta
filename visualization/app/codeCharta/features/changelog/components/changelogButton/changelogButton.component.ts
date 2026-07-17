import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core"
import { ActionIconComponent } from "../../../shared/facade"
import { ChangelogDialogComponent } from "../changelogDialog/changelogDialog.component"

@Component({
    selector: "cc-changelog-button",
    templateUrl: "./changelogButton.component.html",
    imports: [ChangelogDialogComponent, ActionIconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogButtonComponent {
    dialog = viewChild.required<ChangelogDialogComponent>("changelogDialog")

    showChangelog() {
        this.dialog().open()
    }
}
