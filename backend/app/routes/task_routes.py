from fastapi import APIRouter, Depends, HTTPException
from app.database import tasks_collection
from app.models import TaskCreate
from app.routes.auth_routes import get_current_user
from bson import ObjectId

router = APIRouter()


# Get all tasks for current user
@router.get("/")
def get_tasks(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    tasks = list(tasks_collection.find({"user_id": user_id}))
    # Convert _id to string
    for t in tasks:
        t["_id"] = str(t["_id"])
    return tasks


# Add a task
@router.post("/")
def add_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    task_dict = task.dict()
    task_dict["user_id"] = user_id
    tasks_collection.insert_one(task_dict)
    return {"message": "Task added successfully"}


# Delete a task
@router.delete("/{task_id}")
def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    result = tasks_collection.delete_one({"_id": ObjectId(task_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
