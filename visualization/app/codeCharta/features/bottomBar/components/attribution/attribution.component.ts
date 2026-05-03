import { ChangeDetectionStrategy, Component } from "@angular/core"
import packageJson from "../../../../../../package.json"

@Component({
    selector: "cc-attribution",
    templateUrl: "./attribution.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributionComponent {
    readonly version = packageJson.version
}
