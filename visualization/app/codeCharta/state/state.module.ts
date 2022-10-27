import angular from "angular"
import { StoreService } from "./store.service"
import "../codeCharta.module"
import camelCase from "lodash.camelcase"

angular.module("app.codeCharta.state", ["app.codeCharta"]).service(camelCase(StoreService.name), StoreService)
