# frozen_string_literal: true

require 'securerandom'

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Adapter::Persistence
  class CreatureEntity
    attr_reader :id, :type

    def initialize(id = nil, type = nil)
      @id = id || SecureRandom.uuid
      @type = type
    end
  end
end
