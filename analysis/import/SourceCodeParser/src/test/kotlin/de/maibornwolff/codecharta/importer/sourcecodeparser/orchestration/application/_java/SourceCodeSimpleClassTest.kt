package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.NonCodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class SourceCodeSimpleClassTest {

    @Test(expected = IndexOutOfBoundsException::class)
    fun trying_index_0_results_in_exceptions_because_code_starts_at_line_1() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        detailedMetricTable[0]
    }

    @Test
    fun trying_last_index_does_not_result_in_exception() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        detailedMetricTable[detailedMetricTable.rowCount()]
    }

    @Test
    fun finds_all_lines() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.rowCount()).isEqualTo(43)
    }

    @Test
    fun finds_all_comments() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(NonCodeTags.COMMENT)).containsExactly(6, 7, 8, 17, 19)
    }

    @Test
    fun finds_package_declaration() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.PACKAGE)).containsExactly(1)
    }

    @Test
    fun finds_import_statements() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.IMPORT)).containsExactly(3, 4)
    }

    @Test
    fun finds_annotations() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.ANNOTATION_INVOCATION)).containsExactly(9, 12)
    }

    @Test
    fun finds_class() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.CLASS)).containsExactly(10)
    }

    @Test
    fun finds_field_declarations() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.CLASS_FIELD)).containsExactly(13, 15)
    }

    @Test
    fun finds_constructor_declarations() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.CONSTRUCTOR)).containsExactly(18)
    }

    @Test
    fun finds_method_declarations() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.METHOD)).containsExactly(22, 29, 40)
    }

    @Test
    fun finds_global_and_local_variables() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.VARIABLE)).containsExactly(13, 15, 23)
    }

    @Test
    fun finds_expressions_inside_class() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.EXPRESSION))
                .containsExactly(12, 15, 19, 23, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    fun finds_statements_inside_methods() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.STATEMENT))
                .containsExactly(19, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    fun finds_method_calls() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.METHOD_CALL)).containsExactly(32, 34, 37)
    }

    @Test
    fun finds_conditions() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.CONDITION)).containsExactly(31, 34)
    }

    private val code =
"""
package none;

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
}
""".trim().lines()

}