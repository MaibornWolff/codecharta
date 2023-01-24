import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import packageJson from "../../package.json"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "./state/angular-redux/store"

@Component({
	selector: "cc-code-charta",
	templateUrl: "./codeCharta.component.html",
	styleUrls: ["./codeCharta.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CodeChartaComponent implements OnInit {
	version = packageJson.version
	isInitialized = false

	constructor(private store: Store, private loadInitialFileService: LoadInitialFileService) {
		window.addEventListener("load", () => {
			this.isInitialized = true
		})
	}

	async ngOnInit(): Promise<void> {
		this.store.dispatch(setIsLoadingFile(true))
		await this.loadInitialFileService.loadFileOrSample()
	}
}
