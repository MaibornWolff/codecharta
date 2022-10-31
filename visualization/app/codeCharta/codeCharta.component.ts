import "./codeCharta.component.scss"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import packageJson from "../../package.json"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { Component, Inject, OnInit } from "@angular/core"
import { Store } from "./state/angular-redux/store"

@Component({
	selector: "cc-code-charta",
	template: require("./codeCharta.component.html")
})
export class CodeChartaComponent implements OnInit {
	version = packageJson.version

	constructor(
		@Inject(Store) private store: Store,
		@Inject(LoadInitialFileService) private loadInitialFileService: LoadInitialFileService
	) {}

	async ngOnInit(): Promise<void> {
		this.store.dispatch(setIsLoadingFile(true))
		await this.loadInitialFileService.loadFileOrSample()
	}
}
