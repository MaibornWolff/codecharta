import { Component } from "@angular/core"
import packageJson from "../../../../package.json"

@Component({
    selector: "cc-logo",
    templateUrl: "./logo.component.html",
    styleUrls: ["./logo.component.scss"]
})
export class LogoComponent {
    version = packageJson.version
}
