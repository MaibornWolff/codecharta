# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  class Speed
    attr_accessor :feet_per_round

    def initialize(feet_per_round)
      @feet_per_round = feet_per_round
    end

    def to_s
      "#{feet_per_round} ft."
    end
  end
end
