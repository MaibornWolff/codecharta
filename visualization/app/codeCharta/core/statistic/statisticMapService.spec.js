import "./statistic.js";
import {CodeMap} from "../data/model/codeMap.js";
import {STATISTIC_OPS} from "./statisticMapService";

describe("app.codeCharta.core.statistic", function() {



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
            });

    const file_mean = new CodeMap(
        "file",
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
        });

    const file_median = new CodeMap(
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
        });

    const file_max = new CodeMap(
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
        });

    const file_min = new CodeMap(
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
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        });

    const file_fashion = new CodeMap(
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
                        },
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        });

    beforeEach(angular.mock.module("app.codeCharta.core.statistic"));

    it("instance", angular.mock.inject(function(statisticMapService){
        expect(statisticMapService).to.not.equal(undefined);
    }));

    it("test mean", angular.mock.inject(function(statisticMapService){
        const util = require('util');
        const maps = [ file1, file2];
        const resultingMap = statisticMapService.unifyMaps(maps, STATISTIC_OPS.MEAN);
        expect(resultingMap).to.deep.equal(file_mean);
    }));

    it("test median", angular.mock.inject(function(statisticMapService){
        const maps = [ file1, file2];
        const resultingMap = statisticMapService.unifyMaps(maps, STATISTIC_OPS.MEDIAN);
        expect(resultingMap).to.deep.equal(file_median);
    }));

    it("test max", angular.mock.inject(function(statisticMapService){
        const maps = [ file1, file2];
        const resultingMap = statisticMapService.unifyMaps(maps, STATISTIC_OPS.MAX);
        expect(resultingMap).to.deep.equal(file_max);
    }));

    it("test min", angular.mock.inject(function(statisticMapService){
        const maps = [ file1, file2];
        const resultingMap = statisticMapService.unifyMaps(maps, STATISTIC_OPS.MIN);
        expect(resultingMap).to.deep.equal(file_min);
    }));

    it("test fashion", angular.mock.inject(function(statisticMapService){
        const maps = [ file1, file2];
        const resultingMap = statisticMapService.unifyMaps(maps, STATISTIC_OPS.FASHION);
        expect(resultingMap).to.deep.equal(file_fashion);
    }));

    it("test one", angular.mock.inject(function(statisticMapService){
        const util = require('util');
        const map = [file1];
        const resultingMapMean = statisticMapService.unifyMaps(map, STATISTIC_OPS.MEAN);
        const resultingMapMedian = statisticMapService.unifyMaps(map, STATISTIC_OPS.MEDIAN);
        const resultingMapMax = statisticMapService.unifyMaps(map, STATISTIC_OPS.MAX);
        const resultingMapMin = statisticMapService.unifyMaps(map, STATISTIC_OPS.MIN);
        const resultingMapFashion = statisticMapService.unifyMaps(map, STATISTIC_OPS.FASHION);

        expect(resultingMapMean).to.deep.equal(file1);
        expect(resultingMapMedian).to.deep.equal(file1);
        expect(resultingMapMax).to.deep.equal(file1);
        expect(resultingMapMin).to.deep.equal(file1);
        expect(resultingMapFashion).to.deep.equal(file1);
    }));

    it("test repeated", angular.mock.inject(function(statisticMapService){
        const map = [file1, file1, file1, file1];
        const resultingMapMean = statisticMapService.unifyMaps(map, STATISTIC_OPS.MEAN);
        const resultingMapMedian = statisticMapService.unifyMaps(map, STATISTIC_OPS.MEDIAN);
        const resultingMapMax = statisticMapService.unifyMaps(map, STATISTIC_OPS.MAX);
        const resultingMapMin = statisticMapService.unifyMaps(map, STATISTIC_OPS.MIN);
        const resultingMapFashion = statisticMapService.unifyMaps(map, STATISTIC_OPS.FASHION);

        expect(resultingMapMean).to.deep.equal(file1);
        expect(resultingMapMedian).to.deep.equal(file1);
        expect(resultingMapMax).to.deep.equal(file1);
        expect(resultingMapMin).to.deep.equal(file1);
        expect(resultingMapFashion).to.deep.equal(file1);
    }));

    /*
     * It is checked if when introduced in different order the result is the same, not necesarily in the same order
     */
    it("test order", angular.mock.inject(function(statisticMapService){
        const util = require('util');
        const maps1 = [file1, file2];
        const maps2 = [file2, file1];

        const resultingMapMean1 = statisticMapService.unifyMaps(maps1, STATISTIC_OPS.MEAN);
        const resultingMapMedian1 = statisticMapService.unifyMaps(maps1, STATISTIC_OPS.MEDIAN);
        const resultingMapMax1 = statisticMapService.unifyMaps(maps1, STATISTIC_OPS.MAX);
        const resultingMapMin1 = statisticMapService.unifyMaps(maps1, STATISTIC_OPS.MIN);
        const resultingMapFashion1 = statisticMapService.unifyMaps(maps1, STATISTIC_OPS.FASHION);

        const resultingMapMean2 = statisticMapService.unifyMaps(maps2, STATISTIC_OPS.MEAN);
        const resultingMapMedian2 = statisticMapService.unifyMaps(maps2, STATISTIC_OPS.MEDIAN);
        const resultingMapMax2 = statisticMapService.unifyMaps(maps2, STATISTIC_OPS.MAX);
        const resultingMapMin2 = statisticMapService.unifyMaps(maps2, STATISTIC_OPS.MIN);
        const resultingMapFashion2 = statisticMapService.unifyMaps(maps2, STATISTIC_OPS.FASHION);

        expect(statisticMapService.unorderedCompare(resultingMapMean1,resultingMapMean2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapMedian1,resultingMapMedian2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapMax1,resultingMapMax2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapMin1,resultingMapMin2)).to.be.true;
        expect(statisticMapService.unorderedCompare(resultingMapFashion1,resultingMapFashion2)).to.be.true;
    }));
});