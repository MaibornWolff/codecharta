package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.defaultJavaSource
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import org.assertj.core.api.Assertions
import org.junit.Test
import java.io.IOException

class DetailedMetricTableRowTest {

    @Test(expected = IndexOutOfBoundsException::class)
    fun trying_index_0_results_in_exceptions_because_code_starts_at_line_1() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        singleMetrics[0]
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

        Assertions.assertThat(singleMetrics[1][MetricType.RLoc]).isEqualTo(1)
        Assertions.assertThat(singleMetrics[2][MetricType.RLoc]).isEqualTo(1)
        Assertions.assertThat(singleMetrics[2].metricWasIncremented(MetricType.RLoc, singleMetrics[1])).isFalse()
        Assertions.assertThat(singleMetrics[3][MetricType.RLoc]).isEqualTo(2)
        Assertions.assertThat(singleMetrics[3].metricWasIncremented(MetricType.RLoc, singleMetrics[2])).isTrue()
    }

    @Test
    fun does_not_count_comment_line_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[8][MetricType.RLoc]).isEqualTo(3)
        Assertions.assertThat(singleMetrics[9][MetricType.RLoc]).isEqualTo(4)
    }

    @Test
    fun does_not_count_lines_with_only_a_bracket_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[19][MetricType.RLoc]).isEqualTo(10)
        Assertions.assertThat(singleMetrics[20][MetricType.RLoc]).isEqualTo(10)
    }

    @Test
    fun counts_all_lines_as_lines_of_code() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics.rowCount()).isEqualTo(43)
    }

    @Test
    fun counts_only_lines_with_actual_value_as_real() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[43][MetricType.RLoc]).isEqualTo(25)
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