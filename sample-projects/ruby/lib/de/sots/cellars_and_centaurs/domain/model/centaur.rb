# frozen_string_literal: true

require_relative 'creature'
require_relative 'creature_type'
require_relative 'speed'
require_relative 'speed_type'

module De::Sots::CellarsAndCentaurs::Domain::Model
  class Centaur < Creature
    GALLOP = Speed.new(50)

    def initialize(id)
      super(id, CreatureType::MONSTROSITY)
      speeds[SpeedType::WALKING] = GALLOP
    end

    def initiative
      super + 2
    end
  end
end
