import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ScenarioSettingKey } from "../../model/scenarioSettings.registry"
import { ScenarioSettingsPickerComponent } from "./scenarioSettingsPicker.component"

const availableKeys: ScenarioSettingKey[] = ["areaMetric", "margin", "heightMetric", "camera"]

describe("ScenarioSettingsPickerComponent", () => {
    let fixture: ComponentFixture<ScenarioSettingsPickerComponent>
    let component: ScenarioSettingsPickerComponent

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ScenarioSettingsPickerComponent] })

        fixture = TestBed.createComponent(ScenarioSettingsPickerComponent)
        fixture.componentRef.setInput("availableKeys", availableKeys)
        fixture.componentRef.setInput("selectedKeys", new Set<ScenarioSettingKey>(["areaMetric", "margin"]))
        fixture.detectChanges()
        component = fixture.componentInstance
    })

    it("should list only the groups the available settings belong to", () => {
        // Act
        const groups = component.groups()

        // Assert
        expect(groups.map(group => group.key)).toEqual(["area", "height", "camera"])
        expect(groups[0].label).toBe("Area")
        expect(groups[0].settings.map(setting => setting.key)).toEqual(["areaMetric", "margin"])
    })

    it("should report a group as fully selected when all its settings are selected", () => {
        // Act
        const areaGroup = component.groups()[0]

        // Assert
        expect(areaGroup.allSelected).toBe(true)
        expect(areaGroup.someSelected).toBe(true)
    })

    it("should report a group as partially selected when one of its settings is deselected", () => {
        // Act
        component.toggleSetting("margin", false)

        // Assert
        const areaGroup = component.groups()[0]
        expect(areaGroup.allSelected).toBe(false)
        expect(areaGroup.someSelected).toBe(true)
        expect(component.selectedKeys()).toEqual(new Set<ScenarioSettingKey>(["areaMetric"]))
    })

    it("should select a setting that was not selected before", () => {
        // Act
        component.toggleSetting("camera", true)

        // Assert
        expect(component.selectedKeys()).toEqual(new Set<ScenarioSettingKey>(["areaMetric", "margin", "camera"]))
    })

    it("should select every setting of a group at once", () => {
        // Act
        component.toggleGroup(component.groups()[1], true)

        // Assert
        expect(component.selectedKeys()).toEqual(new Set<ScenarioSettingKey>(["areaMetric", "margin", "heightMetric"]))
    })

    it("should deselect every setting of a group at once", () => {
        // Act
        component.toggleGroup(component.groups()[0], false)

        // Assert
        expect(component.selectedKeys()).toEqual(new Set<ScenarioSettingKey>())
        expect(component.groups()[0].someSelected).toBe(false)
    })

    it("should render a checkbox per group and per setting", () => {
        // Act
        const checkboxes = fixture.nativeElement.querySelectorAll("input[type='checkbox']") as NodeListOf<HTMLInputElement>

        // Assert — three groups and four settings
        expect(checkboxes).toHaveLength(7)
        expect(fixture.nativeElement.querySelector("[data-testid='scenario-setting-margin']").checked).toBe(true)
        expect(fixture.nativeElement.querySelector("[data-testid='scenario-setting-camera']").checked).toBe(false)
    })

    it("should select a setting when its checkbox is clicked", () => {
        // Arrange
        const checkbox = fixture.nativeElement.querySelector("[data-testid='scenario-setting-camera']") as HTMLInputElement

        // Act
        checkbox.click()
        fixture.detectChanges()

        // Assert
        expect(component.selectedKeys().has("camera")).toBe(true)
    })

    it("should deselect a whole group when its checkbox is clicked", () => {
        // Arrange
        const checkbox = fixture.nativeElement.querySelector("[data-testid='scenario-group-area']") as HTMLInputElement

        // Act
        checkbox.click()
        fixture.detectChanges()

        // Assert
        expect(component.selectedKeys().has("areaMetric")).toBe(false)
        expect(component.selectedKeys().has("margin")).toBe(false)
    })
})
