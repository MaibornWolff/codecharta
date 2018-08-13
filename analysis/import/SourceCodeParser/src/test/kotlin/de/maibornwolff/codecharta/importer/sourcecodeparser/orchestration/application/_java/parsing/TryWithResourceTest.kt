package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class TryWithResourceTest {

    @Test
    fun example_has_correct_rloc_count() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(13)
    }

    private val code =
            """/*
 * From https://github.com/antlr/grammars-v4/blob/master/java9/examples/TryWithResourceDemo.java
 */
public class TryWithResourceDemo implements AutoCloseable{
	public static void main(String[] args){
		TryWithResourceDemo demo=new TryWithResourceDemo();
		try(demo){demo.doSomething();}
		/* Prior to Java 9, you should write something like
			try(TryWithResourceDemo demo=new TryWithResourceDemo()){demo.doSomething();}
		*/
	}
	public void doSomething(){
		System.out.println("Hello world!");
	}
	@Override
	public void close(){
		System.out.println("I am going to be closed");
	}
}""".lines()
}