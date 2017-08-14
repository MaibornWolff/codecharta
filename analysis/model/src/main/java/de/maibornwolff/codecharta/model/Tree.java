package de.maibornwolff.codecharta.model;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * tree structure
 *
 * @param <T> must satisfy T = Tree<T>
 */
public abstract class Tree<T extends Tree> {
    /**
     * @return children of the present tree
     */
    public abstract List<? extends Tree<T>> getChildren();

    /**
     * get's the path of a given child, i.e. defines the edge to the child.
     *
     * @param child to be found
     * @return path of child in this object
     */
    public abstract Path getPathOfChild(Tree<T> child);

    public final boolean isLeaf() {
        List<? extends Tree<T>> children = getChildren();
        return children == null || children.isEmpty();
    }

    private static final class TreeNode<V> {
        TreeNode(Path path, V node) {
            this.path = path;
            this.node = node;
        }

        final Path path;
        final V node;
    }

    protected Stream<TreeNode<T>> getTreeNodes() {
        return
                Stream.concat(Stream.of(new TreeNode<>(Path.trivialPath(), (T) this)),
                        getChildren().stream()
                                .flatMap(child -> child.getTreeNodes()
                                        .map(entry -> new TreeNode<>(getPathOfChild(child).concat(entry.path), entry.node))
                                ));
    }

    public Map<Path, T> getNodes() {
        return getTreeNodes().collect(Collectors.toMap(n -> n.path, n -> n.node));
    }

    public Map<Path, T> getLeaves() {
        return getTreeNodes().filter(n -> n.node.isLeaf()).collect(Collectors.toMap(n -> n.path, n -> n.node));
    }

    /**
     * @return all leafs of object
     */
    public Stream<T> getLeafObjects() {
        return getTreeNodes().filter(n -> n.node.isLeaf()).map(n -> n.node);
    }

    /**
     * @return all paths to leafs of object
     */
    public Stream<Path> getPathsToLeaves() {
        return getTreeNodes().filter(n -> n.node.isLeaf()).map(n -> n.path);
    }

    /**
     * @param path path in tree
     * @return subtree under this path
     */
    public Optional<? extends Tree<T>> getNodeBy(Path path) {
        if (path.isTrivial()) {
            return Optional.of(this);
        }
        if (path.isSingle()) {
            return getChildren().stream()
                    .filter(child -> path.equals(getPathOfChild(child)))
                    .findFirst();
        }
        Path pathToDirectChild = new Path(Collections.singletonList(path.head()));
        return this.getNodeBy(pathToDirectChild).get().getNodeBy(path.tail());
    }
}
