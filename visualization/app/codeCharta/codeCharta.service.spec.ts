import {CodeChartaService} from "./codeCharta.service";
import {IRootScopeService} from "angular";
import {SettingsService} from "./state/settings.service";
import {getService, instantiateModule} from "../../mocks/ng.mockhelper";
import {FileStateService} from "./state/fileState.service";
import {TEST_FILE_CONTENT} from "./util/dataMocks";

describe("app.codeCharta", function () {

	let services, codeChartaService: CodeChartaService, validFileContent

	beforeEach(() => {
		restartSystem();
		rebuildService();
		validFileContent = TEST_FILE_CONTENT;
	});

	function restartSystem() {
		instantiateModule("app.codeCharta");

		services = {
			$rootScope: getService<IRootScopeService>("$rootScope"),
			settingsService: getService<SettingsService>("settingsService"),
			fileStateService: getService<FileStateService>("fileStateService"),
		};
	}

	function rebuildService() {
		codeChartaService = new CodeChartaService(
			services.$rootScope,
			services.settingsService,
			services.fileStateService,
		);
	}

	// TODO: adapt tests (old data.loading.ts file)
	it("should load a file without edges", ()=> {
		validFileContent.edges = undefined;
		return codeChartaService.loadMapFromFileContent("file.json", validFileContent, 0);
	});

	it("should load a file without edges if no revision index given", ()=> {
		validFileContent.edges = undefined;
		return codeChartaService.loadMapFromFileContent("file.json", validFileContent);
	});

	it("should resolve valid file", ()=> {
		return codeChartaService.loadMapFromFileContent("file.json", validFileContent, 0);
	});

	it("should reject null", (done)=> {
		codeChartaService.loadMapFromFileContent("file.json", null, 0).then(()=>{}, ()=>{
			done();
		}).catch(()=>{
			done()
		});
	});

	it("should reject string", (done)=> {
		codeChartaService.loadMapFromFileContent("file.json", "string", 0).then(()=>{}, ()=>{
			done();
		}).catch(()=>{
			done()
		});
	});

	it("should reject or catch invalid file", (done)=> {
		let invalidFileContent = validFileContent;
		delete invalidFileContent.projectName;
		codeChartaService.loadMapFromFileContent("file.json", invalidFileContent, 0).then(()=>{}, ()=>{
			done();
		}).catch(()=>{
			done()
		});
	});

});

