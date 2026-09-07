# frozen_string_literal: true

require_relative '../../version'
require_relative 'creature_id'

module De::Sots::CellarsAndCentaurs::Domain::Model
  class NoSuchCreatureException < StandardError
    MESSAGE_PREFIX = 'No such creature in the dungeon: '

    attr_reader :creature_id

    def initialize(creature_id)
      @creature_id = creature_id
      super(MESSAGE_PREFIX + creature_id.id.to_s)
    end
  end
end
