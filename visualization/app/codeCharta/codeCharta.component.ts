import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"

@Component({
	selector: "cc-code-charta",
	templateUrl: "./codeCharta.component.html",
	styleUrls: ["./codeCharta.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CodeChartaComponent implements OnInit {
	isInitialized = false

	constructor(private store: Store, private loadInitialFileService: LoadInitialFileService) {}

	async ngOnInit(): Promise<void> {
		this.store.dispatch(setIsLoadingFile({ value: true }))
		await this.loadInitialFileService.loadFilesOrSampleFiles()
		this.isInitialized = true
	}
}
