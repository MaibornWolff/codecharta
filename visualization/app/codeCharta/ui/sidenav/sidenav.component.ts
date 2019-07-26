import "./sidenav.component.scss"

export class SidenavController {
	constructor(private $mdSidenav: (id: string) => { toggle: () => void }) {}

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
