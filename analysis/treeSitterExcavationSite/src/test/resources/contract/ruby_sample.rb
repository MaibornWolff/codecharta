# A comprehensive sample class demonstrating various Ruby features.
# Used for golden file contract testing.

# Module for testing mixins
module Processable
  def process
    "processed"
  end
end

# Status module with constants
module Status
  PENDING = "pending"
  ACTIVE = "active"
  COMPLETED = "completed"
end

class Sample
  include Processable

  # Class-level constant
  MAX_RETRIES = 3

  attr_reader :counter

  def initialize(prefix = "Hello, ")
    @prefix = prefix
    @counter = 0
  end

  # Simple getter with no complexity
  def get_counter
    @counter
  end

  # Calculate sum with validation and control flow
  def calculate(a, b, c, d, e)
    return 0 if a < 0 || b < 0

    sum = 0
    c.times do |i|
      sum += a + b
    end
    while d > 0
      sum += d
      d -= 1
    end
    sum + e
  end

  =begin
  A long method that processes data with nested logic.
  This tests long_method detection (15+ lines).
  =end
  def process_data(items)
    result = ""
    count = 0
    items.each do |item|
      next if item.nil?

      if item.empty?
        result += "empty"
      elsif item.length > 10
        3.times do
          result += item[0, 5]
        end
      else
        result += item
      end
      count += 1
    end
    begin
      result += " total: #{count}"
    rescue StandardError
      return "error"
    end
    result
  end

  # Method chaining example (triggers message_chains metric)
  def chained_call(input)
    return nil if input.nil?

    input.strip.upcase.gsub("A", "X").gsub("B", "Y")
  end

  ##
  # Demonstrates case/when expression usage.
  # @param type [Integer] the type identifier
  # @return [String] formatted result string
  def format_by_type(type)
    label = case type
            when 1 then "one"
            when 2 then "two"
            when 3 then "three"
            else "unknown"
            end
    "#{@prefix}#{label}"
  end

  # Lambda example
  def create_multiplier(factor)
    ->(x) { x * factor }
  end
end
