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

package de.maibornwolff.codecharta.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Represents a path in a tree
 * may be seen as multiple edges in the tree of nodes
 */
public class Path {
    private final List<String> edgesList;

    public Path(List<String> edges) {
        edgesList = edges;
    }

    public Path(String... edges) {
        edgesList = Arrays.asList(edges);
    }

    /**
     * @return first edge in path to node
     */
    public String head() {
        return edgesList.stream().findFirst().orElse("");
    }

    /**
     * @return tail, i.e. the remaining path when the head is removed, if not leaf, trivial element if leaf
     */
    public Path tail() {
        if (isSingle()) {
            return Path.trivialPath();
        }
        return new Path(edgesList.stream().skip(1).collect(Collectors.toList()));
    }

    public List<String> getEdgesList() {
        return edgesList;
    }

    public String last() {
        return edgesList.get(edgesList.size() - 1);
    }

    /**
     * @return true, if there are no edges in the path
     */
    public boolean isTrivial() {
        return edgesList.isEmpty();
    }

    /**
     * @return true, if path consists of one or less edges
     */
    public boolean isSingle() {
        return edgesList.size() <= 1;
    }

    /**
     * @param path that will be added after the present path
     * @return concatinated path
     */
    public Path concat(final Path path) {
        final Path thisPath = this;
        if (thisPath.isTrivial()) {
            return path;
        } else if (path.isTrivial()) {
            return thisPath;
        }
        return new Path(Stream.concat(thisPath.edgesList.stream(), path.edgesList.stream()).collect(Collectors.toList()));
    }

    public String toString() {
        return edgesList.stream().collect(Collectors.joining(" -> "));
    }

    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Path that = (Path) o;

        return edgesList != null ? edgesList.equals(that.edgesList) : that.edgesList == null;
    }

    public int hashCode() {
        return edgesList != null ? edgesList.hashCode() : 0;
    }

    public static Path trivialPath() {
        return TRIVIAL;
    }

    public static final Path TRIVIAL = new Path(Collections.emptyList());
}