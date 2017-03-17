"use strict";

import {SliderDirective} from "./sliderDirective.js";

angular.module("app.codeCharta.ui.common.slider",[]);

angular.module("app.codeCharta.ui.common.slider").directive(
    "sliderDirective",
    () => new SliderDirective()
);
