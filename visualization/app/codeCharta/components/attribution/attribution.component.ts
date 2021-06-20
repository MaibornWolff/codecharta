import { Component } from "@angular/core"

import packageJson from "../../../../package.json"
import "./attribution.component.scss"
import logo from "./logo.png"

@Component({
	selector: "cc-attribution",
	template: require("./attribution.component.html")
})
export class AttributionComponent {
	version = packageJson.version
	logo = logo
}
