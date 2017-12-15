package de.maibornwolff.codecharta.model.input;

public class Modification {
    private final String filename;
    private final int additions;
    private final int deletions;

    public Modification(String filename) {
        this.filename = filename;
        this.additions = 0;
        this.deletions = 0;
    }

    public Modification(String filename, int additions, int deletions) {
        this.filename = filename;
        this.additions = additions;
        this.deletions = deletions;
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
}
