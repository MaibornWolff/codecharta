package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class DoubleColonTest {

    @Test
    fun annotation_example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(18)
    }

    private val code =
            """/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne8.java
 */

// Double colon
public class For {
    public void bar() {
        Function<Computer, Integer> getAge = Computer::getAge;
        Integer computerAge = getAge.apply(c1);

        Function<Computer, Integer> getAgeAlt = this::getAge;
        Function<Computer, Integer> getAgeAlt2 = MyClass.this::getAge;
        Function<Computer, Integer> getAgeAlt3 = generate()::getAge;
        Function<Computer, Integer> getAgeAlt4 = MyClass.generate()::getAge;
        Function<Computer, Integer> getAgeAlt5 = MyClass.twice().nested()::getAge;
        Function<Computer, Integer> getAgeAlt6 = twice().nested()::getAge;
        Function<Computer, Integer> getAgeAlt7 = this.singletonInstanceMethod::get;

        autodetect(this.beans, ((AutodetectCapableMBeanInfoAssembler) this.assembler)::includeBean);

        TriFunction <Integer, String, Integer, Computer> c6Function = Computer::new;
        Computer c3 = c6Function.apply(2008, "black", 90);

        Function <Integer, Computer[]> computerCreator = Computer[]::new;
        Computer[] computerArray = computerCreator.apply(5);
    }
}""".trim().lines()
}