import "./statistic.js";
import {CodeMap} from "../data/model/codeMap.js";
import {STATISTIC_OPS} from "./statistic.service";
import {DataModel} from "../data/model/dataModel";
import {Settings} from "../settings/model/settings";

xdescribe("app.codeCharta.core.statistic", function() {

    var data,settings;

    const file1 = new CodeMap(
        "file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                        }
                    ]
                }
            ]
        }
    );

    const file2 = new CodeMap(
        "file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 200, "functions": 20, "mcc": 2},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    );

    const file_mean = new CodeMap(
        "MEAN_file_file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 150, "functions": 15, "mcc": 1.5},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 35, "functions": 500, "mcc": 5}
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 30, "functions": 100, "mcc": 100}
                        }
                    ]
                }
            ]
        }
    );

    const file_median = new CodeMap(
        "MEDIAN_file_file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 200, "functions": 20, "mcc": 2},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    );

    const file_max = new CodeMap(
        "MAX_file_file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 200, "functions": 20, "mcc": 2},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    );

    const file_min = new CodeMap(
        "MIN_file_file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    );

    const file_fashion = new CodeMap(
        "FASHION_file_file",
        "Sample Project",
        {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    );

    beforeEach(angular.mock.module("app.codeCharta.core.statistic"));
    beforeEach(() =>{
        data = new DataModel();
        data.referenceMap = file1;
        settings = new Settings();
    });

    /**
     * @test {statisticMapService}
     */
    it("instance", angular.mock.inject(function(statisticMapService){
        expect(statisticMapService).to.not.equal(undefined);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test mean", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MEAN;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).to.deep.equal(file_mean);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test median", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MEDIAN;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).to.deep.equal(file_median);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test max", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MAX;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).to.deep.equal(file_max);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test min", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.MIN;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).to.deep.equal(file_min);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test fashion", angular.mock.inject(function(statisticMapService){
        data.revisions = [ file1, file2];
        settings.operation = STATISTIC_OPS.FASHION;
        const resultingMap = statisticMapService.unifyMaps(data, settings);
        expect(resultingMap).to.deep.equal(file_fashion);
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

        expect(resultingMapMean).to.deep.equal(file1);
        expect(resultingMapMedian).to.deep.equal(file1);
        expect(resultingMapMax).to.deep.equal(file1);
        expect(resultingMapMin).to.deep.equal(file1);
        expect(resultingMapFashion).to.deep.equal(file1);
    }));

    /**
     * @test {statisticMapService}
     */
    it("test repeated", angular.mock.inject(function(statisticMapService){
        data.revisions= [file1, file1, file1, file1];
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

        expect(resultingMapMean.root).to.deep.equal(file1.root);
        expect(resultingMapMedian.root).to.deep.equal(file1.root);
        expect(resultingMapMax.root).to.deep.equal(file1.root);
        expect(resultingMapMin.root).to.deep.equal(file1.root);
        expect(resultingMapFashion.root).to.deep.equal(file1.root);
    }));

    /**
     * @test {statisticMapService}
     * It is checked if when introduced in different order the result is the same, not necesarily in the same order
     */
    it("test order", angular.mock.inject(function(statisticMapService){

        data.revisions= [file1, file2];
        settings.operation = STATISTIC_OPS.MEAN;
        const resultingMapMean1 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MEDIAN;
        const resultingMapMedian1 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MAX;
        const resultingMapMax1 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MIN;
        const resultingMapMin1 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.FASHION;
        const resultingMapFashion1 = statisticMapService.unifyMaps(data, settings);


        data.revisions= [file2, file1];
        settings.operation = STATISTIC_OPS.MEAN;
        const resultingMapMean2 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MEDIAN;
        const resultingMapMedian2 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MAX;
        const resultingMapMax2 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.MIN;
        const resultingMapMin2 = statisticMapService.unifyMaps(data, settings);
        settings.operation = STATISTIC_OPS.FASHION;
        const resultingMapFashion2 = statisticMapService.unifyMaps(data, settings);

        expect(statisticMapService.unorderedCompare(resultingMapMean1,resultingMapMean2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapMedian1,resultingMapMedian2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapMax1,resultingMapMax2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapMin1,resultingMapMin2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapFashion1,resultingMapFashion2)).to.be.true;
    }));
});