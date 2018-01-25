package de.maibornwolff.codecharta.importer.scmlogparser.input;

public class Modification {
    public static final Modification EMPTY = new Modification("");

    private final String filename;
    private final String oldFilename;
    private final int additions;
    private final int deletions;
    private final Type type;

    public Modification(String filename) {
        this(filename, 0, 0, Type.UNKNOWN);
    }

    public Modification(String filename, int additions, int deletions) {
        this(filename, additions, deletions, Type.UNKNOWN);
    }

    public Modification(String filename, Type type) {
        this(filename, 0, 0, type);
    }

    public Modification(String filename, String oldFilename, Type type) {
        this(filename, oldFilename, 0, 0, type);
    }

    public Modification(String filename, int additions, int deletions, Type type) {
        this(filename, "", additions, deletions, type);
    }

    public Modification(String filename, String oldFilename, int additions, int deletions, Type type) {
        this.filename = filename;
        this.oldFilename = oldFilename;
        this.additions = additions;
        this.deletions = deletions;
        this.type = type;
    }

    public String getFilename() {
        return filename;
    }

    public int getAdditions() {
        return additions;
    }

    public int getDeletions() {
        return deletions;
    }

    public Type getType() {
        return type;
    }

    public String getOldFilename() {
        return oldFilename;
    }

    public enum Type {
        ADD,
        DELETE,
        MODIFY,
        RENAME,
        UNKNOWN
    }
}
