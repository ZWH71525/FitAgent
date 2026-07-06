# FitAgent

FitAgent 是一个面向减脂用户的 AI 饮食记录与体重趋势分析网页应用。

用户可以通过自然语言记录每日饮食，系统会自动估算热量，并结合体重记录生成趋势图和每日减脂建议。项目目标是帮助减脂用户更轻松地记录饮食、理解体重变化，并获得可执行的调整建议。

## 项目背景

在减脂过程中，很多用户会遇到几个常见问题：

- 每天吃了什么很难长期记录
- 食物热量估算麻烦，容易低估摄入
- 体重短期波动容易造成焦虑
- 不知道当前饮食是否适合自己的减脂目标

FitAgent 希望通过 AI Agent 的方式，把饮食记录、热量估算、趋势分析和每日建议整合在一个简单的网页应用中。

## 核心功能

### V1 版本

- 自然语言饮食输入
- AI 自动拆解食物并估算热量
- 每日体重记录
- 热量摄入趋势图
- 体重变化趋势图
- 每日减脂建议生成

## 页面设计

V1 版本包含 3 个主要页面：

1. Dashboard 首页
2. 饮食记录页
3. 体重记录页

## 技术栈

- Frontend: React / Next.js
- Backend: Python FastAPI
- Database: SQLite
- Chart: Recharts
- AI: LLM API
- Deployment: Vercel + Render

## 系统设计

用户输入饮食文本后，后端调用 AI 模型进行结构化解析，得到食物名称、数量、估算热量和营养信息。系统将结果保存到数据库，并结合体重记录生成趋势分析和每日建议。

## 数据表设计

### users

- id
- name
- height
- start_weight
- target_weight
- daily_calorie_goal

### meal_logs

- id
- user_id
- date
- raw_text
- total_calories
- ai_summary

### meal_items

- id
- meal_log_id
- name
- amount
- calories
- protein
- carbs
- fat

### weight_logs

- id
- user_id
- date
- weight
- note

## Roadmap

### V1

- 饮食文本输入
- 热量估算
- 体重记录
- 趋势图
- 每日建议

### V2

- 饮食结构分析
- 蛋白质、碳水、脂肪比例分析
- 正念日记和减脂心得记录

### V3

- 个性化减脂菜谱推荐
- 运动记录和建议
- 低卡食品推荐与避雷

### V4

- 拍照识别食物
- AI 陪伴聊天

### V5

- 社区分享
- 减脂成果展示
- 用户互相鼓励与经验交流

## 项目价值

这个项目不仅是一个简单的记录工具，也展示了 AI Agent 在真实生活场景中的应用能力，包括自然语言理解、结构化信息抽取、数据分析、趋势预测和个性化建议生成。
