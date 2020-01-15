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

import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher

object ProjectMatcher {

    fun matchesProject(expectedProject: Project): Matcher<Project> {
        return object: BaseMatcher<Project>() {

            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedProject)
            }

            override fun matches(item: Any): Boolean {
                return match(item as Project, expectedProject)
            }
        }
    }

    fun matchesProjectUpToVersion(expectedProject: Project): Matcher<Project> {
        return object: BaseMatcher<Project>() {

            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedProject)
            }

            override fun matches(item: Any): Boolean {
                return matchUpToVersion(item as Project, expectedProject)
            }
        }
    }

    fun matchUpToVersion(p1: Project, p2: Project): Boolean {
        return NodeMatcher.match(p1.rootNode, p2.rootNode)
               && match(p1.edges, p2.edges)
    }

    fun match(d1: List<Edge>, d2: List<Edge>): Boolean {
        return true
    }

    fun match(p1: Project, p2: Project): Boolean {
        return p1.apiVersion == p2.apiVersion
               && matchUpToVersion(p1, p2)
    }
}
