from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Date
from sqlalchemy import ForeignKey

from database import Base


class Farmer(Base):

    __tablename__ = "farmers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    farmer_name = Column(
        String,
        nullable=False
    )

    mobile = Column(
        String,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )

    area = Column(
        Float,
        nullable=False
    )

    season = Column(
        String,
        nullable=False
    )

    crop = Column(
        String,
        nullable=False
    )

    sowing_date = Column(
        Date,
        nullable=False
    )


class FarmRecord(Base):

    __tablename__ = "farm_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    farmer_id = Column(
        Integer,
        ForeignKey("farmers.id"),
        nullable=False
    )

    crop = Column(
        String,
        nullable=False
    )

    season = Column(
        String,
        nullable=False
    )

    area = Column(
        Float,
        nullable=False
    )

    sowing_date = Column(
        Date,
        nullable=False
    )

    year = Column(
        Integer,
        nullable=False
    )