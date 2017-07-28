package de.maibornwolff.codecharta.filter.util

import de.maibornwolff.codecharta.util.NullableMapMerger
import org.hamcrest.CoreMatchers.equalTo
import org.junit.Assert.assertThat
import org.junit.Test

class NullableMapMergerTest {
    val merger = NullableMapMerger<String>()

    @Test
    fun should_merge_null() {
        val mergedMap = merger.merge(null, null)
        assertThat(mergedMap, equalTo(mapOf()))
    }

    @Test
    fun should_merge_empty_map() {
        val mergedMap = merger.merge(mapOf(), null)
        assertThat(mergedMap, equalTo(mapOf()))
    }

    @Test
    fun should_merge_map_with_empty_map() {
        val map = mapOf<String, Any>(Pair("a", "b"))
        val mergedMap = merger.merge(mapOf(), map)
        assertThat(mergedMap, equalTo(map))
    }

    @Test
    fun should_merge_two_maps() {
        val map1 = mapOf<String, Any>(Pair("a", "a"))
        val map2 = mapOf<String, Any>(Pair("b", "b"))
        val expectedMergedMap = mapOf<String, Any>(Pair("a", "a"), Pair("b", "b"))
        val mergedMap = merger.merge(map1, map2)
        assertThat(mergedMap, equalTo(expectedMergedMap))
    }
}