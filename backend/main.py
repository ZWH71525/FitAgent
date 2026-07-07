import json
import os
import re
from typing import Any
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="FitAgent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://eloquent-klepon-56c57f.netlify.app",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MealAnalyzeRequest(BaseModel):
    text: str


RULES = [
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


def safe_number(value: Any, default: float = 0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def rule_based_analyze(text: str) -> dict:
    total_calories = 0
    matched_items = []

    for item in RULES:
        if item["keyword"] in text:
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
        "raw_text": text,
        "matched_items": matched_items,
        "total_calories": total_calories,
        "summary": summary,
        "source": "rule_based",
    }


def extract_json_from_text(content: str) -> dict:
    content = content.strip()
    content = re.sub(r"^```json\s*", "", content)
    content = re.sub(r"^```\s*", "", content)
    content = re.sub(r"\s*```$", "", content)
    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        raise ValueError("LLM response does not contain valid JSON.")
    return json.loads(match.group(0))


def normalize_llm_result(raw_text: str, data: dict) -> dict:
    matched_items = data.get("matched_items", [])
    normalized_items = []
    for item in matched_items:
        keyword = str(item.get("keyword") or item.get("name") or "未知食物")
        normalized_items.append(
            {
                "keyword": keyword,
                "amount": str(item.get("amount", "")),
                "calories": int(safe_number(item.get("calories"), 0)),
                "protein": round(safe_number(item.get("protein"), 0), 1),
                "carbs": round(safe_number(item.get("carbs"), 0), 1),
                "fat": round(safe_number(item.get("fat"), 0), 1),
            }
        )

    total_calories = int(
        safe_number(
            data.get("total_calories"),
            sum(item["calories"] for item in normalized_items),
        )
    )
    summary = str(
        data.get("summary")
        or "已根据饮食文本完成热量估算，建议结合全天摄入和体重趋势继续观察。"
    )

    return {
        "raw_text": raw_text,
        "matched_items": normalized_items,
        "total_calories": total_calories,
        "summary": summary,
        "source": "llm",
    }


def analyze_with_llm(text: str) -> dict | None:
    api_key = os.getenv("LLM_API_KEY")
    api_url = os.getenv("LLM_API_URL")
    model = os.getenv("LLM_MODEL", "deepseek-v4-flash")
    print("LLM_API_KEY loaded:", bool(api_key))
    print("LLM_API_URL loaded:", api_url)
    if not api_key or not api_url:
        return None

    system_prompt = """你是一个减脂饮食记录助手。你的任务是根据用户输入的中文自然语言饮食记录，估算食物、份量、热量和宏量营养素。要求：1. 只输出 JSON，不要输出 Markdown，不要解释。2. 热量是估算值，不要伪装成精确医学数据。3. 如果用户没有写清份量，要根据常见一份食物进行保守估算。4. 输出字段必须包含 raw_text, matched_items, total_calories, summary。5. matched_items 中每个食物包含 keyword, amount, calories, protein, carbs, fat。6. protein、carbs、fat 单位是克。7. summary 用中文，给出简短减脂建议。"""

    user_prompt = f"""请分析这段饮食记录，并输出 JSON：{text}输出 JSON 格式示例：{{  "raw_text": "早餐吃了一个鸡蛋和一杯豆浆",  "matched_items": [    {{      "keyword": "鸡蛋",      "amount": "1个",      "calories": 70,      "protein": 6,      "carbs": 1,      "fat": 5    }}  ],  "total_calories": 150,  "summary": "本餐热量较低，蛋白质来源较明确，可以结合全天摄入继续观察。"}}"""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 800,
        "response_format": {"type": "json_object"},
        "thinking": {"type": "disabled"},
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=30) as client:
            response = client.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        parsed = extract_json_from_text(content)
        return normalize_llm_result(text, parsed)
    except Exception as exc:
        print(f"LLM analysis failed: {exc}")
        return None


@app.get("/")
def read_root():
    return {"message": "FitAgent backend is running"}


@app.post("/api/analyze-meal")
def analyze_meal(request: MealAnalyzeRequest):
    llm_result = analyze_with_llm(request.text)
    if llm_result:
        return llm_result
    return rule_based_analyze(request.text)
