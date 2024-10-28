import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { FilePanelDeltaSelectorComponent } from "./filePanelDeltaSelector.component"
import { CCFile, CcState } from "../../../codeCharta.model"
import { setDeltaComparison, setDeltaReference, switchReferenceAndComparison } from "../../../state/store/files/files.actions"
import { clone } from "../../../util/clone"
import { TEST_FILE_DATA, TEST_FILE_DATA_WITH_COMPLEXITY } from "../../../util/dataMocks"
import { MatSelectModule } from "@angular/material/select"
import { render } from "@testing-library/angular"
import { RemoveExtensionPipe } from "../../../util/pipes/removeExtension.pipe"

describe(FilePanelDeltaSelectorComponent.name, () => {
    let store: Store<CcState>
    const mockedDialog = { open: jest.fn() }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot({}), MatDialogModule, MatSelectModule],
            declarations: [FilePanelDeltaSelectorComponent, RemoveExtensionPipe],
            providers: [{ provide: MatDialog, useValue: mockedDialog }, Store]
        })
    })

    it("should dispatch setDeltaReference when handleDeltaReferenceFileChange is called", async () => {
        const fixture = await renderComponent()
        const spy = jest.spyOn(store, "dispatch")

        const file: CCFile = clone(TEST_FILE_DATA)
        fixture.componentInstance.handleDeltaReferenceFileChange(file)

        expect(spy).toHaveBeenCalledWith(setDeltaReference({ file }))
    })

    it("should dispatch setDeltaComparison when handleDeltaComparisonFileChange is called", async () => {
        const fixture = await renderComponent()
        const spy = jest.spyOn(store, "dispatch")

        const file: CCFile = clone(TEST_FILE_DATA)
        fixture.componentInstance.handleDeltaComparisonFileChange(file)

        expect(spy).toHaveBeenCalledWith(setDeltaComparison({ file }))
    })

    it("should dispatch switchReferenceAndComparison when switchReferenceAndComparison is called", async () => {
        const fixture = await renderComponent()
        const spy = jest.spyOn(store, "dispatch")

        fixture.componentInstance.switchReferenceAndComparison()

        expect(spy).toHaveBeenCalledWith(switchReferenceAndComparison())
    })

    it("should open dialog if maps are incompatible", async () => {
        const fixture = await renderComponent()
        const componentInstance = fixture.componentInstance
        const fileB: CCFile = clone(TEST_FILE_DATA_WITH_COMPLEXITY)
        fileB.fileMeta.fileName = "file_B.cc.json"

        jest.spyOn(componentInstance, "alertOnIncompatibleMaps").mockReturnValue(true)
        jest.spyOn(componentInstance, "areMapsIncompatible").mockReturnValue(true)
        const spyOpenDialog = jest.spyOn(componentInstance, "openIncompatibleMapsDialog")

        componentInstance.handleDeltaReferenceFileChange(fileB)

        expect(componentInstance.alertOnIncompatibleMaps).toHaveBeenCalled()
        expect(componentInstance.areMapsIncompatible).toHaveBeenCalled()
        expect(spyOpenDialog).toHaveBeenCalled()
    })

    it("should not open dialog if maps are compatible", async () => {
        const fixture = await renderComponent()
        const componentInstance = fixture.componentInstance
        const fileB: CCFile = clone(TEST_FILE_DATA_WITH_COMPLEXITY)
        fileB.fileMeta.fileName = "file_B.cc.json"

        jest.spyOn(componentInstance, "alertOnIncompatibleMaps").mockReturnValue(true)
        jest.spyOn(componentInstance, "areMapsIncompatible").mockReturnValue(false)
        const spyOpenDialog = jest.spyOn(componentInstance, "openIncompatibleMapsDialog")

        componentInstance.handleDeltaReferenceFileChange(fileB)

        expect(componentInstance.alertOnIncompatibleMaps).toHaveBeenCalled()
        expect(componentInstance.areMapsIncompatible).toHaveBeenCalled()
        expect(spyOpenDialog).not.toHaveBeenCalled()
    })

    async function renderComponent() {
        const { fixture } = await render(FilePanelDeltaSelectorComponent, { excludeComponentDeclaration: true })
        store = TestBed.inject(Store)
        return fixture
    }
})
