CREATE TRIGGER dbo.order_logged ON dbo.orders AFTER UPDATE AS
BEGIN
    INSERT INTO dbo.order_log SELECT id FROM inserted;
    INSERT INTO dbo.order_log SELECT id FROM deleted;
END
GO
