import angular from "angular";
import "../../core/core.module";

import "./temporalCoupling.scss";

import {temporalCouplingComponent} from "./temporalCouplingComponent";

angular.module("app.codeCharta.ui.temporalCoupling", ["app.codeCharta.core"])
    .component(
        temporalCouplingComponent.selector, temporalCouplingComponent
    );