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

/**
 * Represents a path in a tree of T objects
 * may be seen as multiple edges in the tree of nodes
 */
public abstract class Path<T> {
    /**
     * @return first edge in path to node
     */
    public abstract T head();

    /**
     * @return tail, i.e. the remaining path when the head is removed, if not leaf, trivial element if leaf
     */
    public abstract Path<T> tail();

    /**
     * @return true, if there are no edges in the path
     */
    public boolean isTrivial() {
        return this == Path.TRIVIAL;
    }

    /**
     * @return true, if path consists of one or less edges
     */
    public boolean isSingle() {
        return isTrivial() || tail().isTrivial();
    }

    /**
     * @param path for comparison
     * @return are paths semantically equivalent
     */
    public boolean equalsTo(Path<T> path) {
        boolean headsEqual = path.head() == head() || (path.head() != null && path.head().equals(head()));
        boolean tailsEqual = (path.isTrivial() && isTrivial()) || path.tail().equalsTo(tail());
        return headsEqual && tailsEqual;
    }

    /**
     * @param path that will be added after the present path
     * @return concatinated path
     */
    public Path<T> concat(final Path<T> path) {
        final Path<T> thisPath = this;
        if (thisPath.isTrivial()) {
            return path;
        } else if (path.isTrivial()) {
            return thisPath;
        }
        return new Path<T>() {
            @Override
            public T head() {
                return thisPath.head();
            }

            @Override
            public Path<T> tail() {
                return thisPath.tail().concat(path);
            }

            @Override
            public String toString() {
                return thisPath.toString() + " -> " + path.toString();
            }
        };
    }

    public static final <S> Path<S> trivialPath(){
        return (Path<S>) TRIVIAL;
    }

    public static final Path TRIVIAL = new Path() {
        @Override
        public Object head() {
            return null;
        }

        @Override
        public Path tail() {
            return TRIVIAL;
        }

        @Override
        public String toString() {
            return "emptyPath ->";
        }
    };
}