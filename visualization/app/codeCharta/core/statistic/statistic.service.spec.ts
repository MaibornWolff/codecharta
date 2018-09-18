import "./statistic.module";
import angular from "angular";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import {CodeMap} from "../data/model/codeMap";
import {STATISTIC_OPS} from "./statistic.service";
import {DataModel} from "../data/data.service";
import {Settings} from "../settings/settings.service";

describe("app.codeCharta.core.statistic", function() {

    let settings:Settings;
    let data:DataModel;

    const file1: CodeMap = {
        fileName: "file",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        }
                    ]
                }
            ]
        }
    };

    const file2: CodeMap = {
        fileName: "file",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    const file_mean: CodeMap = {
        fileName: "MEAN_file_file",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 150, "functions": 15, "mcc": 1.5},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 35, "functions": 500, "mcc": 5}
                        },
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 30, "functions": 100, "mcc": 100}
                        }
                    ]
                }
            ]
        }
    };

    const file_median: CodeMap = {
        fileName: "MEDIAN_file_file",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    const file_max: CodeMap = {
        fileName: "MAX_file_file",
        projectName: "Sample Project",
        root: {
            name:"root",
            type: "Folder",
            attributes:{},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    const file_min: CodeMap = {
        fileName: "MIN_file_file",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    const file_fashion: CodeMap = {
        fileName: "FASHION_file_file",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    beforeEach(NGMock.mock.module("app.codeCharta.core.statistic"));
    beforeEach(() =>{
        data = {} as DataModel;
        settings = {} as Settings;
        data.renderMap = file1;
    });

    /**
     * @test {statisticMapService}
     */
    it("instance", angular.mock.inject(function(statisticMapService){
        expect(statisticMapService).not.toBe(undefined);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test mean", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MEAN;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).toEqual(file_mean);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test median", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MEDIAN;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).toEqual(file_median);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test max", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MAX;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).toEqual(file_max);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test min", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MIN;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).toEqual(file_min);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test fashion", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.FASHION;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).toEqual(file_fashion);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test one", angular.mock.inject(function(statisticMapService){
        data.revisions = [file1];
        settings.operation = STATISTIC_OPS.MEAN;
        const resultingMapMean = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MEDIAN;
        const resultingMapMedian = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MAX;
        const resultingMapMax = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MIN;
        const resultingMapMin = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.FASHION;
        const resultingMapFashion = statisticMapService.unifyMaps(data, settings);

        expect(resultingMapMean).toEqual(file1);
        expect(resultingMapMedian).toEqual(file1);
        expect(resultingMapMax).toEqual(file1);
        expect(resultingMapMin).toEqual(file1);
        expect(resultingMapFashion).toEqual(file1);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test repeated", angular.mock.inject(function(statisticMapService){
        data.revisions = [file1, file1, file1, file1];
        settings.operation = STATISTIC_OPS.MEAN;
        const resultingMapMean = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MEDIAN;
        const resultingMapMedian = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MAX;
        const resultingMapMax = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MIN;
        const resultingMapMin = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.FASHION;
        const resultingMapFashion = statisticMapService.unifyMaps(data, settings);

        expect(resultingMapMean.root).toEqual(file1.root);
        expect(resultingMapMedian.root).toEqual(file1.root);
        expect(resultingMapMax.root).toEqual(file1.root);
        expect(resultingMapMin.root).toEqual(file1.root);
        expect(resultingMapFashion.root).toEqual(file1.root);
    }));

});