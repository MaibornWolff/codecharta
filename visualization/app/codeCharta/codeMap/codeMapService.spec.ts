import "./codeMap";

import {CodeMapService} from "./codeMapService";
import {NG} from "../../ng.mockhelper";

describe("app.codeCharta.codeMap.codeMapService", function () {

    let codeMapService: CodeMapService, $scope;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.module("app.codeCharta.codeMap"));

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