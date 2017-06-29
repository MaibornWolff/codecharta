package de.maibornwolff.codecharta.model.input;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.HashSet;
import java.util.Set;

public class VersionControlledFile {

    private final String filename;

    private int numberOfOccurrencesInCommits;

    private final Set<CalendarWeek> weeksWithCommits;

    private final Set<String> authors;

    public VersionControlledFile(String filename) {
        this.filename = filename;
        this.numberOfOccurrencesInCommits = 0;
        this.authors = new HashSet<>();
        this.weeksWithCommits = new HashSet<>();
    }

    public void registerCommit(Commit commit) {
        numberOfOccurrencesInCommits++;
        authors.add(commit.getAuthor());
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.getCommitDate()));
    }

    public String getFilename() {
        return filename;
    }

    public int getNumberOfOccurrencesInCommits() {
        return numberOfOccurrencesInCommits;
    }

    public Set<String> getAuthors() {
        return authors;
    }

    public int getNumberOfAuthors() {
        return this.authors.size();
    }

    @Override
    public String toString() {
        return this.getFilename() + " was changed " + this.getNumberOfOccurrencesInCommits() + " time(s).";
    }

    public int getNumberOfWeeksWithCommits() {
        return weeksWithCommits.size();

    }


    static class CalendarWeek {
        final int week;
        final int year;

        public CalendarWeek(int week, int year) {
            this.week = week;
            this.year = year;
        }

        public static CalendarWeek forDateTime(LocalDateTime dateTime) {
            int cwWeek = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear());
            int cwYear = dateTime.getYear();
            cwYear = modifyYear(dateTime, cwWeek, cwYear);
            return new CalendarWeek(cwWeek, cwYear);
        }

        private static int modifyYear(LocalDateTime dateTime, int cwWeek, int cwYear) {
            if (dayIsOneOfTheLastSevenDaysInYear(dateTime) && isFirstOrSecondWeek(cwWeek))
                cwYear++;
            else if (dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime) && !isFirstOrSecondWeek(cwWeek))
                cwYear--;
            return cwYear;
        }

        private static boolean dayIsOneOfTheFirstSevenDaysOfTheYear(LocalDateTime dateTime) {
            return dateTime.getDayOfYear() < 7;
        }

        private static boolean isFirstOrSecondWeek(int kalenderWeeknWeek) {
            return kalenderWeeknWeek <= 2;
        }

        private static boolean dayIsOneOfTheLastSevenDaysInYear(LocalDateTime dateTime) {
            return dateTime.getDayOfYear() > 358;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            CalendarWeek that = (CalendarWeek) o;

            if (week != that.week) return false;
            return year == that.year;
        }

        @Override
        public int hashCode() {
            int result = week;
            result = 31 * result + year;
            return result;
        }
    }

}
