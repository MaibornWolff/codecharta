package none;

/** Tracks warehouse shipments so the invoice can name what actually left the building. */
public class Warehouse {
    private final ShipmentLedger shipmentLedger;

    public Warehouse(ShipmentLedger shipmentLedger) {
        this.shipmentLedger = shipmentLedger;
    }

    public Invoice invoiceForShipment(Shipment shipment) {
        return shipmentLedger.recordShipment(shipment).toInvoice();
    }
}
