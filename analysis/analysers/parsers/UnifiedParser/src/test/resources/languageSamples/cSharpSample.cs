namespace SampleApp.Core.Utils.Helpers
{
    public static class TaskHelpers
    {
        // returns whether the task should have been done in the past
        public static bool IsTaskOverdue(DateTime dueDate)
        {
            return dueDate < DateTime.Now;
        }

        public static string GetPriorityLabel(Models.Priority priority)
        {
            return priority switch
            {
                Models.Priority.Low => "Low Priority",
                Models.Priority.Medium => "Medium Priority",
                Models.Priority.High => "High Priority",
                _ => "Unknown"
            };
        }

        public static int CalculateDaysRemaining(DateTime dueDate)
        {
            var remaining = (dueDate - DateTime.Now).Days;
            return remaining < 0 ? 0 : remaining;
        }
    }
}
