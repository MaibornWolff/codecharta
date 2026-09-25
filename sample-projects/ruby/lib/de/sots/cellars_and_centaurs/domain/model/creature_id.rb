# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  class CreatureId
    attr_reader :id

    def initialize(id)
      @id = id
    end

    def ==(other)
      other.is_a?(CreatureId) && other.id == id
    end
    alias eql? ==

    def hash
      id.hash
    end
  end
end
