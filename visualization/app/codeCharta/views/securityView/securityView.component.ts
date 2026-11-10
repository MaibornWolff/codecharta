import { ChangeDetectionStrategy, Component } from "@angular/core"
import { SecurityPageComponent } from "../../features/security/facade"
import { LoadingFileProgressSpinnerComponent } from "../../features/shared/facade"

@Component({
    selector: "cc-security-view",
    template: `
        <cc-loading-file-progress-spinner view="security"></cc-loading-file-progress-spinner>
        <cc-security-page></cc-security-page>
    `,
    imports: [LoadingFileProgressSpinnerComponent, SecurityPageComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityViewComponent {}
