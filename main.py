from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv

load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TodoCreate(BaseModel):
    title: str

class TodoRead(BaseModel):
    id: int
    title: str
    class Config:
        orm_mode = True

@app.get("/todos", response_model=List[TodoRead])
def read_todos():
    db = SessionLocal()
    todos = db.query(Todo).all()
    db.close()
    return todos

@app.post("/todos", response_model=TodoRead)
def create_todo(todo: TodoCreate):
    db = SessionLocal()
    db_todo = Todo(title=todo.title)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    db.close()
    return db_todo

@app.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, todo: TodoCreate):
    db = SessionLocal()
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        db.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    db_todo.title = todo.title
    db.commit()
    db.refresh(db_todo)
    db.close()
    return db_todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    db = SessionLocal()
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        db.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    db.close()
    return {"ok": True}

# Check database connection at startup
@app.on_event("startup")
def check_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except OperationalError as e:
        import sys
        print(f"Database connection failed: {e}")
        sys.exit(1)
