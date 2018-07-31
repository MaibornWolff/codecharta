package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThatExceptionOfType
import org.assertj.core.api.Assertions.fail
import org.junit.Test

class DetailedMetricTableRowTest {

    @Test
    fun trying_index_0_results_in_exceptions_because_code_starts_at_line_1() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertThatExceptionOfType(IndexOutOfBoundsException::class.java).isThrownBy{ singleMetrics[0] }
    }

    @Test
    fun trying_last_index_does_not_result_in_exception() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        singleMetrics[singleMetrics.rowCount()]
    }

    @Test
    fun does_not_count_empty_line_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){it[1][MetricType.RLoc]}.isEqualTo(1)
        assertWithPrintOnFail(singleMetrics){it[2][MetricType.RLoc]}.isEqualTo(1)
        Assertions.assertThat(singleMetrics[2].metricWasIncremented(MetricType.RLoc, singleMetrics[1])).isFalse()
        Assertions.assertThat(singleMetrics[3][MetricType.RLoc]).isEqualTo(2)
        Assertions.assertThat(singleMetrics[3].metricWasIncremented(MetricType.RLoc, singleMetrics[2])).isTrue()
    }

    @Test
    fun does_not_count_comment_line_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){it[8][MetricType.RLoc]}.isEqualTo(3)
        assertWithPrintOnFail(singleMetrics){it[9][MetricType.RLoc]}.isEqualTo(4)
    }

    @Test
    fun count_lines_with_only_a_bracket_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){it[19][MetricType.RLoc]}.isEqualTo(10)
        assertWithPrintOnFail(singleMetrics){it[20][MetricType.RLoc]}.isEqualTo(11)
    }

    @Test
    fun counts_all_lines_as_lines_of_code() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){it.rowCount()}.isEqualTo(43)
    }

    @Test
    fun counts_only_lines_with_actual_value_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){it[43][MetricType.RLoc]}.isEqualTo(31)
    }

    private val code =
"""package none;

import foo;
import bar;

/*
 * class comment
 */
@Entity
public class Foo {

    @Deprecated("this is bad code")
    private int stuff;

    private volatile boolean wasReset = false;

    // constructor, d'uh
    public Foo(){
        stuff = 5; // magic number
    }

    public Blub getStuff(){
        int i = stuff - 1;
        i++;
        i = i + 0;
        return i;
    }

    public void setStuff(int stuff){
        this.wasReset = false;
        if(stuff < 0){
            reset(5);
            wasReset = true;
        } else if(reset(-1)){
            this.stuff = stuff;
        }
        System.out.println("SetStuff was called");
    }

    private void reset(int num){
        this.stuff = 0;
    }
}""".lines()
}