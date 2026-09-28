# frozen_string_literal: true

require 'logger'

require_relative '../../version'
require_relative 'creatures'
require_relative '../model/creature'

module De::Sots::CellarsAndCentaurs::Domain::Service
  class CreatureService
    def initialize(creatures, logger = Logger.new($stdout))
      @creatures = creatures
      @logger = logger
    end

    def save(creature)
      @logger.info("saving creature #{creature.id.id}")
      @creatures.save(creature)
    end

    def find(creature_id)
      @creatures.find(creature_id)
    end
  end
end
