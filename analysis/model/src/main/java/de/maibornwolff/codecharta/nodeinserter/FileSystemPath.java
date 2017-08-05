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

package de.maibornwolff.codecharta.nodeinserter;

import de.maibornwolff.codecharta.model.Path;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class FileSystemPath extends Path<String> {
    private static final char PATH_SEPARATOR = '/';
    private final List<String> edgeStream;


    private FileSystemPath(List<String> edges) {
        edgeStream = edges;
    }

    public FileSystemPath(String path) {
        if (path == null) {
            throw new IllegalArgumentException("Path should be non-null and non-empty.");
        }
        edgeStream = Arrays.stream(path.split("" + PATH_SEPARATOR)).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    @Override
    public boolean isSingle() {
        return edgeStream.size() <= 1;
    }

    @Override
    public boolean isTrivial() {
        return edgeStream.size() == 0;
    }

    @Override
    public String head() {
        return edgeStream.stream().findFirst().orElse("");
    }

    @Override
    public Path<String> tail() {
        if (isSingle()) {
            return Path.trivialPath();
        }
        return new FileSystemPath(edgeStream.stream().skip(1).collect(Collectors.toList()));
    }

    @Override
    public String toString() {
        return edgeStream.stream().collect(Collectors.joining("" + PATH_SEPARATOR));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        FileSystemPath that = (FileSystemPath) o;

        return edgeStream != null ? edgeStream.equals(that.edgeStream) : that.edgeStream == null;
    }

    @Override
    public int hashCode() {
        return edgeStream != null ? edgeStream.hashCode() : 0;
    }
}
