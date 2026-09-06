# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  # Hit points drop when the creature takes damage and recover when it rests in its lair.
  class HitPoints
    MAX_HIT_POINTS = 999

    attr_reader :current, :max, :temporary

    def initialize(current, max, temporary = 0)
      @current = current
      @max = [max, MAX_HIT_POINTS].min
      @temporary = temporary
    end

    def self.init(max)
      new(max, max, 0)
    end

    def take_damage(amount)
      HitPoints.new([current - amount, 0].max, max, temporary)
    end

    def rest
      HitPoints.new(max, max, 0)
    end

    def alive?
      current.positive?
    end
  end
end
