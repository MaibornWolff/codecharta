package de.maibornwolff.codecharta.model.input.metrics;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;

class CalendarWeek {
    private final int week;
    private final int year;

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

        return week == that.week && year == that.year;
    }

    @Override
    public int hashCode() {
        int result = week;
        result = 31 * result + year;
        return result;
    }
}
