
import { Component, ViewEncapsulation } from "@angular/core"
import packageJson from "../../../../package.json"

@Component({
	selector: "cc-logo",
	templateUrl: "./logo.component.html",
	encapsulation: ViewEncapsulation.None
})
export class LogoComponent {
	version = packageJson.version

	constructor() {}
}