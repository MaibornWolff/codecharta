/**
 * A comprehensive sample class demonstrating various C# features.
 * Used for golden file contract testing.
 */

using System;
using System.Collections.Generic;
using System.Linq;

namespace Sample
{
    // Interface for testing
    public interface IProcessable
    {
        string Process();
    }

    // Enum for testing
    public enum Status
    {
        Pending,
        Active,
        Completed
    }

    public class Sample : IProcessable
    {
        // Class-level constant
        private const int MaxRetries = 3;
        private readonly string _prefix;
        private int _counter;

        public Sample(string prefix = "Hello, ")
        {
            _prefix = prefix;
            _counter = 0;
        }

        /// <summary>Simple getter with no complexity</summary>
        public int GetCounter()
        {
            return _counter;
        }

        // Calculate sum with validation and control flow
        public int Calculate(int a, int b, int c, int d, int e)
        {
            if (a < 0 || b < 0)
            {
                return 0;
            }
            var sum = 0;
            for (var i = 0; i < c; i++)
            {
                sum += a + b;
            }
            while (d > 0)
            {
                sum += d;
                d--;
            }
            return sum + e;
        }

        /*
         * A long method that processes data with nested logic.
         * This tests long_method detection (15+ lines).
         */
        public string ProcessData(List<string> items)
        {
            var result = "";
            var count = 0;
            foreach (var item in items)
            {
                if (item == null)
                {
                    continue;
                }
                if (item.Length == 0)
                {
                    result += "empty";
                }
                else if (item.Length > 10)
                {
                    for (var i = 0; i < 3; i++)
                    {
                        result += item.Substring(0, 5);
                    }
                }
                else
                {
                    result += item;
                }
                count++;
            }
            try
            {
                result += $" total: {count}";
            }
            catch (Exception)
            {
                return "error";
            }
            return result;
        }

        // Method chaining example (triggers message_chains metric)
        public string ChainedCall(string input)
        {
            return input?.Trim()
                .ToUpper()
                .Replace("A", "X")
                .Replace("B", "Y");
        }

        /// <summary>
        /// Demonstrates switch expression usage.
        /// </summary>
        /// <param name="type">the type identifier</param>
        /// <returns>formatted result string</returns>
        public string FormatByType(int type)
        {
            var label = type switch
            {
                1 => "one",
                2 => "two",
                3 => "three",
                _ => "unknown"
            };
            return _prefix + label;
        }

        // LINQ example
        public List<string> FilterItems(List<string> items)
        {
            return items.Where(item => item.Length > 3).ToList();
        }

        // Lambda expression example
        public Func<int, int> CreateMultiplier(int factor)
        {
            return x => x * factor;
        }

        // Interface implementation
        public string Process()
        {
            return "processed";
        }
    }
}
