package SampleApp.Core.Utils.Helpers

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

object TaskHelpers {
    // returns whether the task should have been done in the past
    fun isTaskOverdue(dueDate: LocalDateTime): Boolean {
        return dueDate.isBefore(LocalDateTime.now())
    }

    fun getPriorityLabel(priority: Priority): String {
        return when (priority) {
            Priority.LOW -> "Low Priority"
            Priority.MEDIUM -> "Medium Priority"
            Priority.HIGH -> "High Priority"
            else -> "Unknown"
        }
    }

    fun calculateDaysRemaining(dueDate: LocalDateTime): Int {
        val remaining = ChronoUnit.DAYS.between(LocalDateTime.now(), dueDate).toInt()
        return if (remaining < 0) 0 else remaining
    }
}

enum class Priority {
    LOW, MEDIUM, HIGH, OTHER
}
