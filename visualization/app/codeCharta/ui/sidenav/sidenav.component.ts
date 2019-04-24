import "./sidenav.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class SidenavController {
	constructor(private dialogService: DialogService, private $mdSidenav: (id: string) => { toggle: () => void }) {}

	public showUrlParams() {
		this.dialogService.showQueryParamDialog()
	}

	public toggleSidenav(navID) {
		this.$mdSidenav(navID).toggle()
	}
}

export const sidenavComponent = {
	selector: "sidenavComponent",
	template: require("./sidenav.component.html"),
	controller: SidenavController
}

export const sidenavToggleComponent = {
	selector: "sidenavToggleComponent",
	template: require("./sidenav.toggle.component.html"),
	controller: SidenavController
}
