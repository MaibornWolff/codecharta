package de.maibornwolff.codecharta.importer.sonar.model;

public class PagingInfo {
    private int pageIndex;
    private int pageSize;
    private int total;

    public PagingInfo() {
        super();
    }

    public PagingInfo(int pageIndex, int pageSize, int total) {
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.total = total;
    }

    public int getPageIndex() {
        return pageIndex;
    }

    public int getPageSize() {
        return pageSize;
    }

    public int getTotal() {
        return total;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PagingInfo that = (PagingInfo) o;

        if (pageIndex != that.pageIndex) return false;
        if (pageSize != that.pageSize) return false;
        return total == that.total;
    }

    @Override
    public int hashCode() {
        int result = pageIndex;
        result = 31 * result + pageSize;
        result = 31 * result + total;
        return result;
    }

    @Override
    public String toString() {
        return "PagingInfo{" +
                "pageIndex=" + pageIndex +
                ", pageSize=" + pageSize +
                ", total=" + total +
                '}';
    }
}
