import { TestBed } from "@angular/core/testing"
import { MatDialog, MatDialogRef } from "@angular/material/dialog"
import { expect } from "@jest/globals"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { queryByRole, queryByText, render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CustomConfigMapSelectionMode } from "../../../../model/customConfig/customConfig.api.model"
import { defaultState } from "../../../../state/store/state.manager"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CUSTOM_CONFIG_ITEM_GROUPS } from "../../../../util/dataMocks"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../codeMap/threeViewer/threeMapControls.service"
import { CustomConfigsModule } from "../../customConfigs.module"
import { visibleFilesBySelectionModeSelector } from "../../visibleFilesBySelectionMode.selector"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup.component"

describe("customConfigItemGroupComponent", () => {
    let mockedDialog = { open: jest.fn() }
    let mockedDialogReference = { close: jest.fn() }

    beforeEach(() => {
        mockedDialog = { open: jest.fn() }
        mockedDialogReference = { close: jest.fn() }

        TestBed.configureTestingModule({
            imports: [CustomConfigsModule],
            providers: [
                { provide: MatDialogRef, useValue: mockedDialogReference },
                { provide: MatDialog, useValue: mockedDialog },
                { provide: ThreeCameraService, useValue: {} },
                { provide: ThreeMapControlsService, useValue: {} },
                provideMockStore({
                    selectors: [
                        {
                            selector: visibleFilesBySelectionModeSelector,
                            value: {
                                mapSelectionMode: CustomConfigMapSelectionMode.MULTIPLE,
                                assignedMaps: new Map([
                                    ["md5_fileB", "fileB"],
                                    ["md5_fileC", "fileC"]
                                ])
                            }
                        }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
    })

    it("should apply a custom Config and close custom config dialog", async () => {
        CustomConfigHelper.applyCustomConfig = jest.fn()
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { customConfigItemGroups }
        })
        const applyCustomConfigButton = screen.getAllByText("mcc")[0].closest("button")
        await userEvent.click(applyCustomConfigButton)

        expect(applyCustomConfigButton.disabled).toBe(false)
        expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
        expect(mockedDialogReference.close).toHaveBeenCalledTimes(1)
    })

    it("should remove a custom Config and not close custom config dialog", async () => {
        CustomConfigHelper.deleteCustomConfig = jest.fn()
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { customConfigItemGroups }
        })

        await userEvent.click(screen.getAllByTitle("Remove Custom View")[0])

        expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledTimes(1)
        expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith("File_B_File_C_STANDARD_Sample_Map View #1")
        expect(mockedDialogReference.close).toHaveBeenCalledTimes(0)
    })

    it("should apply a custom config and close custom config dialog when clicking on config name", async () => {
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { customConfigItemGroups }
        })

        CustomConfigHelper.applyCustomConfig = jest.fn()
        const applyCustomConfigButton = screen.getByText("SampleMap View #1").closest("span") as HTMLElement

        await userEvent.click(applyCustomConfigButton)

        expect(CustomConfigHelper.applyCustomConfig).toHaveBeenCalledTimes(1)
        expect(mockedDialogReference.close).toHaveBeenCalledTimes(1)
    })

    it("should show tooltip with missing maps and correct selection mode if selected custom config is not fully applicable", async () => {
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])

        const { rerender } = await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { customConfigItemGroups }
        })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(visibleFilesBySelectionModeSelector, {
            mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
            assignedMaps: new Map([["md5_fileB", "fileB"]])
        })
        store.refreshState()

        // Empty Component Input to rerender it completely
        await rerender()
        await rerender({ componentProperties: { customConfigItemGroups } })

        const applyCustomConfigButton = screen.getAllByText("mcc")[0].closest("button")

        expect(
            screen.getAllByTitle(
                "This view is partially applicable. To complete your view, please switch to the STANDARD mode and select the following map(s): fileC."
            ).length
        ).toBe(2)
        expect(getComputedStyle(applyCustomConfigButton).color).toBe("rgb(204, 204, 204)")
    })

    it("should not be clickable for non-applicable custom configs, but can still change notes of custom configs", async () => {
        CustomConfigHelper.applyCustomConfig = jest.fn()
        CustomConfigHelper.applyCustomConfig = jest.fn()
        CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").hasApplicableItems = false
        CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").customConfigItems[0].isApplicable = false
        CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD").customConfigItems[1].isApplicable = false
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        const { rerender } = await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { customConfigItemGroups }
        })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(visibleFilesBySelectionModeSelector, {
            mapSelectionMode: CustomConfigMapSelectionMode.DELTA,
            assignedMaps: new Map([["md5_fileA", "fileA"]])
        })
        store.refreshState()
        // Empty Component Input to rerender it completely
        await rerender()
        await rerender({ componentProperties: { customConfigItemGroups } })

        const editNoteArea = screen.getAllByTitle("Edit/View Note")[0] as HTMLButtonElement
        const applyCustomConfigButton = screen.getAllByText("mcc")[0].closest("button") as HTMLButtonElement

        expect(applyCustomConfigButton.disabled).toBe(true)
        expect(editNoteArea.disabled).toBe(false)
        expect(getComputedStyle(applyCustomConfigButton).color).toBe("rgb(204, 204, 204)")
    })

    it("should expand custom config item group on toggle expansion", async () => {
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        const { fixture, container } = await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: {
                expandedStates: {}
            },
            componentInputs: {
                customConfigItemGroups,
                searchTerm: ""
            }
        })

        expect(fixture.componentInstance.isGroupExpanded("Custom View(s) in Standard mode for fileB fileC")).toBeFalsy()

        const header = queryByRole(container as HTMLElement, "button")
        expect(header).not.toBeNull()

        const toggleGroupExpansionSpy = jest.spyOn(fixture.componentInstance, "toggleGroupExpansion")

        await userEvent.click(header)

        expect(toggleGroupExpansionSpy).toBeCalledTimes(1)
        waitFor(() => {
            expect(fixture.componentInstance.isGroupExpanded("Custom View(s) in Standard mode for fileB fileC")).toBeTruthy()
        })
    })

    it("should reset expanded states on new searchterm or configitems", async () => {
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        const { rerender, fixture } = await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: {
                expandedStates: {}
            },
            componentInputs: {
                customConfigItemGroups,
                searchTerm: ""
            }
        })

        waitFor(() => {
            expect(fixture.componentInstance.isGroupExpanded("Custom View(s) in Standard mode for fileB fileC")).toBeFalsy()
        })

        await rerender({
            componentProperties: {
                expandedStates: {}
            },
            componentInputs: {
                customConfigItemGroups,
                searchTerm: "rloc"
            }
        })

        waitFor(() => {
            expect(fixture.componentInstance.isGroupExpanded("Custom View(s) in Standard mode for fileB fileC")).toBeTruthy()
        })

        await rerender({
            componentProperties: {
                expandedStates: {}
            },
            componentInputs: {
                customConfigItemGroups,
                searchTerm: ""
            }
        })

        waitFor(() => {
            expect(fixture.componentInstance.isGroupExpanded("Custom View(s) in Standard mode for fileB fileC")).toBeFalsy()
        })
    })

    it("should display no configs found message when searchterm doesnt match any configs", async () => {
        const customConfigItemGroups = new Map([["File_B_File_C_STANDARD", CUSTOM_CONFIG_ITEM_GROUPS.get("File_B_File_C_STANDARD")]])
        const { rerender, container } = await render(CustomConfigItemGroupComponent, {
            excludeComponentDeclaration: true,
            componentProperties: {
                expandedStates: {}
            },
            componentInputs: {
                customConfigItemGroups,
                searchTerm: ""
            }
        })

        expect(queryByText(container as HTMLElement, "No configurations found.")).toBeNull()

        await rerender({
            componentProperties: {
                expandedStates: {}
            },
            componentInputs: {
                customConfigItemGroups,
                searchTerm: "non matching searchterm"
            }
        })

        expect(queryByText(container as HTMLElement, "No configurations found.")).not.toBeNull()
    })
})
