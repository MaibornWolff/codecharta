import {ThreeRendererService} from "./threeRendererService";
import {SettingsService} from "../../../core/settings/settings.service";
jest.mock("../../../core/settings/settings.service")
describe("ThreeRender service", ()=> {

    let threeRenderService: ThreeRendererService;
    let settingsService: SettingsService;

    beforeEach(()=>{
        settingsService = new SettingsService();
        threeRenderService = new ThreeRendererService(settingsService);
    });

    it("default Background should be normal", ()=> {

    });



});

