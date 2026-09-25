# frozen_string_literal: true

require_relative '../../version'
require_relative '../model/creature'
require_relative '../model/creature_id'
require_relative '../model/errors'

module De::Sots::CellarsAndCentaurs::Domain::Service
  module Creatures
    def save(creature)
      raise NotImplementedError, "#{self.class} must implement save"
    end

    # @raise [NoSuchCreatureException] when the id is unknown
    def find(creature_id)
      raise NotImplementedError, "#{self.class} must implement find"
    end
  end
end
