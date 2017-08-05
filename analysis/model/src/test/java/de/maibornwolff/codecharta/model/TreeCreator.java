package de.maibornwolff.codecharta.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TreeCreator {
    public static Tree createTree() {
        return createTree(Path.TRIVIAL, null);
    }

    public static Tree createTree(final Path pathToInnerTree, final Tree innerTree) {
        return new Tree() {
            @Override
            public List<? extends Tree> getChildren() {
                return innerTree == null ? Collections.emptyList() : Arrays.asList(innerTree);
            }

            @Override
            public Path getPathOfChild(Tree child) {
                return pathToInnerTree;
            }

            @Override
            public String toString() {
                return pathToInnerTree + " -> " + innerTree;
            }
        };
    }
}
