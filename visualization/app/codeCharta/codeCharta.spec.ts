import {CodeChartaController} from "./codeChartaComponent.ts";
import {mock, verify, when, instance, reset} from "ts-mockito";

describe("app.codeCharta.codeChartaController", ()=> {

    describe("unit", () => {

        let mocked: CodeChartaController;

        beforeEach(()=>{
            mocked = mock(CodeChartaController);
        });

        afterEach(()=>{
            reset(mocked);
        });

        it("when loading finishes a scenario should be applied and the maps set", ()=> {

            //given
            when(mocked.loadFileOrSample());
            when(mocked.initHandlers());

            //when
            instance(mocked);

            //verify
            verify(mocked.initHandlers()).called();
            verify(mocked.loadFileOrSample()).called();

        });

        xit("constructor should init everything and load a map", ()=> {

            //given
            when(mocked.loadFileOrSample());
            when(mocked.initHandlers());

            //when
            instance(mocked);

            //verify
            verify(mocked.initHandlers()).called();
            verify(mocked.loadFileOrSample()).called();

        });

    });

});