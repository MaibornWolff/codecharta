package de.maibornwolff.codecharta.importer.understand

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.closeTo
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.expect

class HelperFunctionsTest: Spek({
    data class SumTest(val a: Any, val b: Any, val result: Any)

    describe("sumOrFirst") {
        listOf(
                SumTest(1L, 2L, 3L),
                SumTest(1, 2L, 3L),
                SumTest(1L, 2, 3L),
                SumTest(1.1, 2.0, 3.1),
                SumTest(1.1f, 2.0, 3.1),
                SumTest(1.1, 2.0f, 3.1),
                SumTest(1.1f, 2L, 3.1),
                SumTest(0xFF_EC_DE_5E, 2L, 4293713504),
                SumTest("a", 2L, 2L),
                SumTest(2, "b", 2),
                SumTest("a", "b", "a")
        ).forEach { test ->
            val sum = getSumOrFirst().invoke(test.a, test.b)

            it("calculates sum of ${test.a.javaClass.simpleName} and ${test.b.javaClass.simpleName} " +
               "to type ${test.result.javaClass.simpleName}") {
                expect(test.result.javaClass) { sum.javaClass }
            }

            it("calculates sum of ${test.a} as ${test.a.javaClass.simpleName} and ${test.b} as ${test.b.javaClass.simpleName} " +
               "to type ${test.result}") {
                if (test.result is Double) {
                    assertThat(sum as Double, closeTo(test.result, 0.01))
                } else {
                    expect(test.result) { sum }
                }
            }
        }
    }

    describe("getMaxValOrFirst") {
        listOf(
                SumTest(1L, 2L, 2L),
                SumTest(1, 2L, 2L),
                SumTest(1L, 2, 2L),
                SumTest(1.1, 2.0, 2.0),
                SumTest(1.1f, 2.0, 2.0),
                SumTest(1.1, 2.0f, 2.0),
                SumTest(1.1f, 2L, 2.0),
                SumTest(0xFF_EC_DE_5E, 2L, 4293713502L),
                SumTest("a", 2L, 2L),
                SumTest(2, "b", 2),
                SumTest("a", "b", "a")
        ).forEach { test ->
            val sum = getMaxValOrFirst().invoke(test.a, test.b)

            it("calculates max of ${test.a.javaClass.simpleName} and ${test.b.javaClass.simpleName} " +
               "to type ${test.result.javaClass.simpleName}") {
                expect(test.result.javaClass) { sum.javaClass }
            }

            it("calculates max of ${test.a} as ${test.a.javaClass.simpleName} and ${test.b} as ${test.b.javaClass.simpleName} " +
               "to type ${test.result}") {
                if (test.result is Double) {
                    assertThat(sum as Double, closeTo(test.result, 0.01))
                } else {
                    expect(test.result) { sum }
                }
            }
        }
    }

})