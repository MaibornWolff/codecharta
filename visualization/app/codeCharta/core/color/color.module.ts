import { ColorService } from "./color.service";
import angular from "angular";

angular.module("app.codeCharta.core.color", [])
    .service(
        "colorService", ColorService
    );


