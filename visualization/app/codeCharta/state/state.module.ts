import angular from "angular"
import { FilesService } from "./store/files/files.service"
import { InjectorService } from "./injector.service"
import { StoreService } from "./store.service"
import "../codeCharta.module"
import camelCase from "lodash.camelcase"

angular
	.module("app.codeCharta.state", ["app.codeCharta"])
	.service(camelCase(FilesService.name), FilesService)
	.service(camelCase(InjectorService.name), InjectorService)
	.service(camelCase(StoreService.name), StoreService)
