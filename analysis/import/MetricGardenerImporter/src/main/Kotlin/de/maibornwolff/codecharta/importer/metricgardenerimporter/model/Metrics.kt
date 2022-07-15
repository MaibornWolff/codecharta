package de.maibornwolff.codecharta.importer.metricgardenerimporter.model

import com.fasterxml.jackson.annotation.JsonProperty

class Metrics(
    @JsonProperty("mcc") var mcc: Int,
    @JsonProperty("functions") var functions: Int,
    @JsonProperty("classes") var classes: Int,
    @JsonProperty("lines_of_code") var linesOfCode: Int,
    @JsonProperty("comment_lines") var commentLines: Int,
    @JsonProperty("real_lines_of_code") var realLinesOfCode: Int
             ) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Metrics

        if (mcc != other.mcc) return false
        if (functions != other.functions) return false
        if (classes != other.classes) return false
        if (linesOfCode != other.linesOfCode) return false
        if (commentLines != other.commentLines) return false
        if (realLinesOfCode != other.realLinesOfCode) return false

        return true
    }

    override fun hashCode(): Int {
        var result = mcc
        result = 31 * result + functions
        result = 31 * result + classes
        result = 31 * result + linesOfCode
        result = 31 * result + commentLines
        result = 31 * result + realLinesOfCode
        return result
    }
}
