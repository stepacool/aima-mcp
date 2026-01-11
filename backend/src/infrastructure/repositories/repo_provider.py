from infrastructure.db import create_database, Database


class Provider:
    _db: None | Database = None

    @classmethod
    def get_db(cls, **overrides):
        if cls._db is None:
            cls._db = create_database(**overrides)
        return cls._db

    @classmethod
    async def disconnect(cls):
        if cls._db is None:
            return
        await cls._db.disconnect()

    # @classmethod
    # def customer_repo(cls) -> CustomerRepo:
    #     return CustomerRepo(cls.get_db())
