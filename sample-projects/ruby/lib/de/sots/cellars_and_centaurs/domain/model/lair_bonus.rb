# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Domain::Model
  module LairBonus
    def initiative
      super + 1
    end
  end
end
