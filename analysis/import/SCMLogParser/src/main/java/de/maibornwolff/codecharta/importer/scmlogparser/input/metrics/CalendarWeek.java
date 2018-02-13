package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import java.time.OffsetDateTime;
import java.time.temporal.WeekFields;

class CalendarWeek implements Comparable<CalendarWeek> {
    private final int week;
    private final int year;

    CalendarWeek(int week, int year) {
        this.week = week;
        this.year = year;
    }

    public static CalendarWeek forDateTime(OffsetDateTime dateTime) {
        int cwWeek = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear());
        int cwYear = dateTime.getYear();
        cwYear = modifyYear(dateTime, cwWeek, cwYear);
        return new CalendarWeek(cwWeek, cwYear);
    }

    public static int numberOfWeeksBetween(CalendarWeek a, CalendarWeek b) {
        return (b.week + 52 * b.year) - (a.week + 52 * a.year);
    }

    private static int modifyYear(OffsetDateTime dateTime, int cwWeek, int cwYear) {
        if (dayIsOneOfTheLastSevenDaysInYear(dateTime) && isFirstOrSecondWeek(cwWeek))
            cwYear++;
        else if (dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime) && !isFirstOrSecondWeek(cwWeek))
            cwYear--;
        return cwYear;
    }

    private static boolean dayIsOneOfTheFirstSevenDaysOfTheYear(OffsetDateTime dateTime) {
        return dateTime.getDayOfYear() < 7;
    }

    private static boolean isFirstOrSecondWeek(int kalenderWeeknWeek) {
        return kalenderWeeknWeek <= 2;
    }

    private static boolean dayIsOneOfTheLastSevenDaysInYear(OffsetDateTime dateTime) {
        return dateTime.getDayOfYear() > 358;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CalendarWeek that = (CalendarWeek) o;

        return week == that.week && year == that.year;
    }

    @Override
    public int hashCode() {
        int result = week;
        result = 31 * result + year;
        return result;
    }

    @Override
    public int compareTo(CalendarWeek o) {
        if (o == null) {
            throw new NullPointerException();
        }
        return numberOfWeeksBetween(this, o);
    }
}
