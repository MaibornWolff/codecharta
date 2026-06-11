import { ChangeDetectionStrategy, Component, input } from "@angular/core"

@Component({
    selector: "cc-inspector-node-path",
    templateUrl: "./inspectorNodePath.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block" }
})
export class InspectorNodePathComponent {
    readonly parentPath = input.required<string>()
    readonly nodeName = input.required<string>()
    readonly link = input<string | undefined>()
}
