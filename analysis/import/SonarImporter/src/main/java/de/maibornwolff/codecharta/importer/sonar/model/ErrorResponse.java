package de.maibornwolff.codecharta.importer.sonar.model;

import java.util.Arrays;

public class ErrorResponse {

    private ErrorEntity[] errors;

    public ErrorResponse() {
    }

    public ErrorResponse(ErrorEntity[] errors) {
        this.errors = errors;
    }

    public ErrorEntity[] getErrors() {
        return errors;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ErrorResponse that = (ErrorResponse) o;

        // Probably incorrect - comparing Object[] arrays with Arrays.equals
        return Arrays.equals(errors, that.errors);
    }

    @Override
    public int hashCode() {
        return Arrays.hashCode(errors);
    }
}
