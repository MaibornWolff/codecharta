#include <stdio.h>
#include <string.h>
#include <time.h>

typedef enum {
    PRIORITY_LOW,
    PRIORITY_MEDIUM,
    PRIORITY_HIGH,
    PRIORITY_OTHER
} Priority;

// Returns whether the task should have been done in the past
int isTaskOverdue(time_t dueDate) {
    time_t now = time(NULL);
    return dueDate < now;
}

const char* getPriorityLabel(Priority priority) {
    switch (priority) {
        case PRIORITY_LOW: return "Low Priority";
        case PRIORITY_MEDIUM: return "Medium Priority";
        case PRIORITY_HIGH: return "High Priority";
        default: return "Unknown";
    }
}

/*
  Returns how many days are remaining given a due date
*/
int calculateDaysRemaining(time_t dueDate) {
    time_t now = time(NULL);
    double seconds = difftime(dueDate, now);
    int remaining = (int)(seconds / (60 * 60 * 24));
    return remaining < 0 ? 0 : remaining;
}
