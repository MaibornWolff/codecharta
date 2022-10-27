//@ts-nocheck

import { FilesService } from "./store/files/files.service"

export class InjectorService {
	constructor(
		// We have to inject the services somewhere
		private filesService: FilesService
	) {
		"ngInject"
	}
}
