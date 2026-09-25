# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  class Dice
    attr_reader :sides

    def initialize(sides)
      @sides = sides
    end

    def roll
      DiceRoll.new(self, rand(1..sides))
    end
  end

  class DiceRoll
    attr_reader :dice, :value

    def initialize(dice, value)
      @dice = dice
      @value = value
    end

    def critical?
      value == dice.sides
    end
  end

  D20 = Dice.new(20)

  def self.roll_d20
    d20Roll = D20.roll
    d20Roll
  end
end
