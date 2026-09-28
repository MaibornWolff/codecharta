# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Domain::Model
  class Encounter
    attr_reader :surprise_dice

    def initialize(surprise_dice = Dice.new(6))
      @surprise_dice = surprise_dice
    end

    # @return [DiceRoll]
    def surprise_roll
      surprise_dice.roll
    end
  end
end
