unit de.sots.cellarsandcentaurs.application.Bootstrap;

interface

type
  TBootstrap = class
  public
    class var ArmorDescription: string;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.application.CreatureUtil;

initialization
  TBootstrap.ArmorDescription := TCreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION;

end.
