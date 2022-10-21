import { Store } from "../../../state/store/store"
import { TestBed } from "@angular/core/testing"
import { CustomConfigsModule } from "../customConfigs.module"
import { MatDialog } from "@angular/material/dialog"
import { CustomConfigListComponent } from "./customConfigList.component"
import { render, screen } from "@testing-library/angular"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { of } from "rxjs"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../util/dataMocks"
import { DownloadableConfigs } from "../downloadCustomConfigsButton/getDownloadableCustomConfigs"
import { CustomConfigItemGroup } from "../customConfigs.component"
import { CustomConfigGroups } from "./getCustomConfigItemGroups"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import userEvent from "@testing-library/user-event"

const mockedCustomConfigHelperService = {
	customConfigItemGroups$: of({
		applicableItems: new Map() as Map<string, CustomConfigItemGroup>,
		nonApplicableItems: new Map() as Map<string, CustomConfigItemGroup>
	} as CustomConfigGroups),
	downloadableCustomConfigs$: of(new Map() as DownloadableConfigs)
}

describe("customConfigListComponent", () => {
	let mockedDialog = { open: jest.fn() }

	beforeEach(() => {
		mockedDialog = { open: jest.fn() }
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [CustomConfigsModule],
			providers: [
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: CustomConfigHelperService, useValue: mockedCustomConfigHelperService },
				{ provide: ThreeSceneService, useValue: {} },
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeOrbitControlsService, useValue: {} }
			]
		})
	})

	it("should show initial text when there are no custom configs", async () => {
		await render(CustomConfigListComponent, { excludeComponentDeclaration: true })

		expect(screen.getByText("It is time to add your first Custom View!")).not.toBeNull()
	})

	it("should show 'download', 'upload', 'add' and 'non-applicable' custom config button", async () => {
		const customConfigItemGroup = {
			applicableItems: new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]]),
			nonApplicableItems: new Map([["File_D_DELTA", CUSTOM_CONFIG_ITEM_GROUPS.get("File_D_DELTA")]])
		}
		mockedCustomConfigHelperService.customConfigItemGroups$ = of(customConfigItemGroup)
		await render(CustomConfigListComponent, { excludeComponentDeclaration: true })

		expect(screen.getByTitle("Create new Custom View")).not.toBeNull()
		expect(screen.getByTitle("Download Custom View related to currently uploaded maps, if any.")).not.toBeNull()
		expect(screen.getByTitle("Upload Custom View (.cc.config.json file).")).not.toBeNull()
		expect(screen.queryByText("Show non-applicable Custom Views")).not.toBeNull()
	})

	it("should show custom config item groups for applicable and non-applicable custom configs", async () => {
		const customConfigItemGroup = {
			applicableItems: new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]]),
			nonApplicableItems: new Map([["File_D_DELTA", CUSTOM_CONFIG_ITEM_GROUPS.get("File_D_DELTA")]])
		}
		mockedCustomConfigHelperService.customConfigItemGroups$ = of(customConfigItemGroup)
		const { container } = await render(CustomConfigListComponent, { excludeComponentDeclaration: true })

		expect(container.querySelector("mat-expansion-panel-header").textContent).toBe(
			" Custom View(s) in  multiple  mode for fileB fileC "
		)
		expect(container.querySelectorAll("mat-expansion-panel-header").length).toBe(1)

		await userEvent.click(screen.queryByText("Show non-applicable Custom Views"))

		expect(container.querySelectorAll("mat-expansion-panel-header").length).toBe(2)
	})

	it("should not show 'non-applicable Custom Views' button when no custom configs are available", async () => {
		const customConfigItemGroup = {
			applicableItems: new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]]),
			nonApplicableItems: new Map()
		}
		mockedCustomConfigHelperService.customConfigItemGroups$ = of(customConfigItemGroup)

		await render(CustomConfigListComponent, { excludeComponentDeclaration: true })

		expect(screen.queryByText("Show non-applicable Custom Views")).toBeNull()
	})

	it("should list all custom configs belonging to a custom config item group by clicking", async () => {
		const customConfigItemGroup = {
			applicableItems: new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]]),
			nonApplicableItems: new Map([["File_D_DELTA", CUSTOM_CONFIG_ITEM_GROUPS.get("File_D_DELTA")]])
		}
		mockedCustomConfigHelperService.customConfigItemGroups$ = of(customConfigItemGroup)
		const { container } = await render(CustomConfigListComponent, { excludeComponentDeclaration: true })

		const customConfigItemGroupElement = container.querySelector("mat-expansion-panel-header")

		await userEvent.click(customConfigItemGroupElement)

		expect(container.querySelectorAll("mat-list-item").length).toBe(2)
		expect(screen.getByText("SampleMap View #1")).not.toBeNull()
		expect(screen.getByText("SampleMap View #2")).not.toBeNull()
	})

	it("should disable button for all custom configs belonging to a non-applicable custom config item group", async () => {
		const customConfigItemGroup = {
			applicableItems: new Map([["File_B_File_C_MULTIPLE", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_MULTIPLE")]]),
			nonApplicableItems: new Map([["File_D_DELTA", CUSTOM_CONFIG_ITEM_GROUPS.get("File_D_DELTA")]])
		}
		mockedCustomConfigHelperService.customConfigItemGroups$ = of(customConfigItemGroup)
		const { container } = await render(CustomConfigListComponent, { excludeComponentDeclaration: true })

		await userEvent.click(screen.queryByText("Show non-applicable Custom Views"))

		const customConfigItemGroupElement = container.querySelectorAll("mat-expansion-panel-header")[1]

		await userEvent.click(customConfigItemGroupElement)

		expect(screen.getByText("SampleMap Delta View #1")).not.toBeNull()
		expect(screen.getByText("SampleMap Delta View #1").closest("button").hasAttribute("disabled")).toBe(true)
	})
})
