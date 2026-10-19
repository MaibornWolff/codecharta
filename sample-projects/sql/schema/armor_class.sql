-- T-SQL
CREATE TABLE [dbo].[ArmorClass] (
    [CreatureId] CHAR(36) NOT NULL REFERENCES [dbo].[creature] ([creature_id]),
    [Value] INT NOT NULL,
    [Description] NVARCHAR(200) NULL
)
GO
