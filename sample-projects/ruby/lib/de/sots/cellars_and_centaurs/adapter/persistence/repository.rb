# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Adapter::Persistence
  class Repository
    include Enumerable

    def initialize
      @rows = {}
    end

    def save(row)
      @rows[key_of(row)] = row
    end

    def find_one(key)
      @rows[key]
    end

    def each(&block)
      @rows.values.each(&block)
    end

    private

    def key_of(row)
      raise NotImplementedError, "#{self.class} must implement key_of"
    end
  end
end
