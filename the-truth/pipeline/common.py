"""Shared paths and helpers for The Truth pipeline."""
import datetime
import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
DB_PATH = DATA / "the_truth.db"
DASHBOARD = ROOT / "dashboard"


def connect():
    """Open the SQLite database. Observation tables are append-only (enforced by triggers)."""
    return sqlite3.connect(DB_PATH)


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
