package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class ResourceSearchHelperTest {

    @Test
    fun `should return true if string equals one or more search tokens`() {
        val resource = "toBeSearched.kt"
        val searchToken = listOf("notToBeSearched1.kt", "toBeSearched.kt", "notToBeSearched2.kt")

        val result = ResourceSearchHelper.doStringsEqual(resource, searchToken)

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return false if no search token equals string`() {
        val resource = "toBeSearched.kt"
        val searchToken = listOf("notToBeSearched1.kt", "notToBeSearched2.kt", "notToBeSearched3.kt")

        val result = ResourceSearchHelper.doStringsEqual(resource, searchToken)

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return true if string ends with one or more of the search tokens`() {
        val resource = "toBeSearched.kt"
        val searchToken = listOf(".html", ".kt", ".js")

        val result = ResourceSearchHelper.doesStringEndWith(resource, searchToken)

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return false if strings ends with none of the search tokens`() {
        val resource = "toBeSearched.kt"
        val searchToken = listOf(".html", ".css", ".js")

        val result = ResourceSearchHelper.doesStringEndWith(resource, searchToken)

        Assertions.assertThat(result).isFalse()
    }
}
