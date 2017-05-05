package de.maibornwolff.codecharta.importer.sonar.model;

public class ErrorEntity {
    private String msg;

    public ErrorEntity() {
    }

    public ErrorEntity(String msg) {

        this.msg = msg;
    }

    public String getMsg() {
        return msg;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ErrorEntity that = (ErrorEntity) o;

        return msg != null ? msg.equals(that.msg) : that.msg == null;

    }

    @Override
    public int hashCode() {
        return msg != null ? msg.hashCode() : 0;
    }
}
