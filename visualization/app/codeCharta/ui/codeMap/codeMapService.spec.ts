import "./codeMap";

import {CodeMapService} from "./codeMapService";
import {NG} from "../../../mocks/ng.mockhelper";

describe("app.codeCharta.ui.codeMap.codeMapService", function () {

    let codeMapService: CodeMapService, $scope;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.module("app.codeCharta.ui.codeMap"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.inject((_codeMapService_, _$rootScope_)=> {
        codeMapService = _codeMapService_;
        $scope = _$rootScope_;
    }));

    describe("scaleMap", ()=>{

        it("should set mapGeometry scale", ()=>{
            //TODO
        });

        it("should set mapGeometry position", ()=>{
            //TODO
        });

        it("should set mapMesh scale if it is exists", ()=>{
            //TODO
        });

        it("should set labelManager scale if it is exists", ()=>{
            //TODO
        });

    });

});