package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.BranchTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.MethodTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.NonCodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.UnsortedCodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class RealLinesOfCodeTest {

    @Test
    fun `trying index 0 results in exceptions because code starts at line 1`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        Assertions.assertThatExceptionOfType(IndexOutOfBoundsException::class.java).isThrownBy { detailedMetricTable[0] }
    }

    @Test
    fun `trying last index does not result in exception`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        detailedMetricTable[detailedMetricTable.rowCount()]
    }

    @Test
    fun `finds all lines`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(detailedMetricTable) { it.rowCount() }.isEqualTo(43)
    }

    @Test
    fun `finds all comments`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(NonCodeTags.COMMENT)).containsExactly(6, 7, 8, 17, 19)
    }

    @Test
    fun `finds package declaration`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.PACKAGE)).containsExactly(1)
    }

    @Test
    fun `finds import statements`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.IMPORT)).containsExactly(3, 4)
    }

    @Test
    fun `finds annotations`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.ANNOTATION_INVOCATION)).containsExactly(9, 12)
    }

    @Test
    fun `finds class`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.CLASS)).containsExactly(10)
    }

    @Test
    fun `finds field declarations`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.CLASS_FIELD)).containsExactly(13, 15)
    }

    @Test
    fun `finds constructor declarations`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.CONSTRUCTOR)).containsExactly(18)
    }

    @Test
    fun `finds method declarations`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(MethodTags.METHOD)).containsExactly(22, 29, 40)
    }

    @Test
    fun `finds global and local variables`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.VARIABLE)).containsExactly(13, 15, 23)
    }

    @Test
    fun `finds expressions inside class`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.EXPRESSION))
                .containsExactly(12, 15, 19, 23, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    fun `finds statements inside methods`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.STATEMENT))
                .containsExactly(19, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    fun `finds method calls`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(UnsortedCodeTags.METHOD_CALL)).containsExactly(32, 34, 37)
    }

    @Test
    fun `finds conditions`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val detailedMetricTable = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(BranchTags.CONDITION)).containsExactly(31, 34)
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