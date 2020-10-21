import {CustomViewBuilder} from "./customViewBuilder";
import {State} from "../codeCharta.model";

describe("CustomViewBuilder", () => {
    describe("buildFromState", () => {
        it("should return a new CustomView instance", () => {
            // provide some default state properties
            const fromState = {
                appSettings: {
                    experimentalFeaturesEnabled: true,
                    showMetricLabelNameValue: undefined,
                    isWhiteBackground: false
                },
                dynamicSettings: {},
                fileSettings: {}
            } as State

            const customView = CustomViewBuilder.buildFromState("test", fromState)

            expect(customView.name).toBe('test')
            expect(typeof customView.stateSettings !== 'undefined').toBe(true)

            expect(typeof customView.stateSettings.appSettings !== 'undefined').toBe(true)
            expect(customView.stateSettings.appSettings.experimentalFeaturesEnabled).toBe(true)
            expect(customView.stateSettings.appSettings.showMetricLabelNameValue).toBe(undefined)
            expect(customView.stateSettings.appSettings.isWhiteBackground).toBe(false)

            expect(typeof customView.stateSettings.dynamicSettings !== 'undefined').toBe(true)
            expect(typeof customView.stateSettings.fileSettings !== 'undefined').toBe(true)
        })
    })
})
