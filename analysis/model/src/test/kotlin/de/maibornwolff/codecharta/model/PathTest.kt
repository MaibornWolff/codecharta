/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.PathMatcher.matchesPath
import junit.framework.TestCase.assertFalse
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.CoreMatchers.not
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.Test
import java.util.*

class PathTest {
    @Test
    fun trivial_path_should_be_equalTo_trivial_path() {
        assertThat(Path.TRIVIAL, matchesPath(Path.TRIVIAL))
    }

    @Test
    fun nonTrivial_path_should_not_be_equalTo_nonTrivial_path() {
        val nonTrivialPath = Path(Arrays.asList("bla"))
        assertThat(Path.TRIVIAL, not(matchesPath(nonTrivialPath)))
        assertThat(nonTrivialPath, not(matchesPath(Path.TRIVIAL)))
    }

    @Test
    fun simple_path_should_be_equalTo_simple_path_iff_head_equal() {
        val nonTrivialPath = Path(Arrays.asList("bla"))
        val anotherNonTrivialPath = Path(Arrays.asList("blubb"))
        assertThat(nonTrivialPath, matchesPath(nonTrivialPath))
        assertThat(nonTrivialPath, not(matchesPath(anotherNonTrivialPath)))
        assertThat(anotherNonTrivialPath, not(matchesPath(nonTrivialPath)))
    }

    @Test
    fun concat_with_trivial_path_should_return_concatinated_path() {
        val nonTrivialPath = Path(Arrays.asList("bla"))
        assertThat(Path.TRIVIAL.concat(Path.TRIVIAL), matchesPath(Path.TRIVIAL))
        assertThat(nonTrivialPath.concat(Path.TRIVIAL), matchesPath(nonTrivialPath))
        assertThat(Path.TRIVIAL.concat(nonTrivialPath), matchesPath(nonTrivialPath))
    }

    @Test
    fun complex_path_should_equal_itself() {
        val firstPath = Path(Arrays.asList("first"))
        val expectedPath = Path(Arrays.asList("second", firstPath.head))

        assertThat(expectedPath, matchesPath(expectedPath))
    }

    @Test
    fun concat_with_two_simple_paths_should_return_concatinated_path() {
        // given
        val firstPath = Path(Arrays.asList("first"))
        val secondPath = Path(Arrays.asList("second"))

        // when
        val concatinatedPath = firstPath.concat(secondPath)

        // then
        val expectedPath = Path(Arrays.asList("first", secondPath.head))
        assertThat(concatinatedPath, not(matchesPath(firstPath)))
        assertThat(concatinatedPath, not(matchesPath(secondPath)))
        assertFalse(concatinatedPath.isSingle)
        assertFalse(concatinatedPath.isTrivial)
        assertThat(concatinatedPath.head, Matchers.`is`("first"))
        assertThat(concatinatedPath.tail, matchesPath(secondPath))
        assertThat(concatinatedPath, matchesPath(expectedPath))
    }


    @Test
    fun last_should_return_last_edged() {
        //given
        val lastEdge = "lastEdge"
        val path = Path(Arrays.asList("a", "b", lastEdge))

        // when
        val edge = path.last()

        // then
        assertThat(edge, `is`(lastEdge))
    }
}