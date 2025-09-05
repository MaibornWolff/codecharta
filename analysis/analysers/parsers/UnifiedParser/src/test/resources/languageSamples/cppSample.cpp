#include <iostream>
#include <string>
#include <chrono>
#include <ctime>

enum class Priority {
    LOW, MEDIUM, HIGH, OTHER
};

class TaskHelpers {
public:
    // returns whether the task should have been done in the past
    static bool isTaskOverdue(const std::chrono::system_clock::time_point& dueDate) {
        return dueDate < std::chrono::system_clock::now();
    }

    static std::string getPriorityLabel(Priority priority) {
        switch (priority) {
            case Priority::LOW: return "Low Priority";
            case Priority::MEDIUM: return "Medium Priority";
            case Priority::HIGH: return "High Priority";
            default: return "Unknown";
        }
    }

    /*
      returns how many days are remaining given a due date
    */
    static int calculateDaysRemaining(const std::chrono::system_clock::time_point& dueDate) {
        auto now = std::chrono::system_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::hours>(dueDate - now).count();
        int remaining = duration / 24;
        return remaining < 0 ? 0 : remaining;
    }
};
