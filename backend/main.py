from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="FitAgent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://eloquent-klepon-56c57f.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MealAnalyzeRequest(BaseModel):
    text: str


@app.get("/")
def read_root():
    return {"message": "FitAgent backend is running"}


@app.post("/api/analyze-meal")
def analyze_meal(request: MealAnalyzeRequest):
    rules = [
        {"keyword": "鸡蛋", "calories": 70},
        {"keyword": "豆浆", "calories": 80},
        {"keyword": "拿铁", "calories": 180},
        {"keyword": "米饭", "calories": 200},
        {"keyword": "鸡胸肉", "calories": 250},
        {"keyword": "沙拉", "calories": 180},
        {"keyword": "牛肉", "calories": 300},
        {"keyword": "面包", "calories": 220},
        {"keyword": "炸鸡", "calories": 650},
        {"keyword": "奶茶", "calories": 450},
        {"keyword": "汉堡", "calories": 500},
        {"keyword": "薯条", "calories": 350},
        {"keyword": "披萨", "calories": 600},
        {"keyword": "蛋糕", "calories": 400},
    ]

    total_calories = 0
    matched_items = []

    for item in rules:
        if item["keyword"] in request.text:
            total_calories += item["calories"]
            matched_items.append(item)

    if total_calories == 0:
        total_calories = 300

    if total_calories >= 1000:
        summary = "本餐热量偏高，建议下一餐减少油炸食物、含糖饮品和高油主食。"
    elif total_calories <= 400:
        summary = "本餐热量较低，如果正在减脂，也要注意保证蛋白质和基础能量摄入。"
    else:
        summary = "本餐热量处于中等水平，可以结合全天总摄入继续观察。"

    return {
        "raw_text": request.text,
        "matched_items": matched_items,
        "total_calories": total_calories,
        "summary": summary,
    }