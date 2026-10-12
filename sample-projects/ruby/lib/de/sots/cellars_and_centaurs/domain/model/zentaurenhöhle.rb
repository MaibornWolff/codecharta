# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Domain::Model
  # Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
  class Zentaurenhöhle
    LABEL = 'Größe der Höhle'

    attr_reader :rüstungsklasse

    def initialize(rüstungsklasse)
      @rüstungsklasse = rüstungsklasse
    end

    def to_s
      "#{LABEL}: #{rüstungsklasse}"
    end
  end
end
