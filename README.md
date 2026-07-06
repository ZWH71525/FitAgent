# FitAgent

FitAgent 是一个面向减脂用户的 AI 饮食记录与体重趋势分析网页应用。

用户可以通过自然语言记录每日饮食，系统会自动估算热量，并结合体重记录生成趋势图和每日减脂建议。项目目标是帮助减脂用户更轻松地记录饮食、理解体重变化，并获得可执行的调整建议。

## 在线 Demo

Frontend: https://eloquent-klepon-56c57f.netlify.app
Backend API: https://fitagent-backend.onrender.com

## 项目背景

在减脂过程中，很多用户会遇到以下问题：

- 每天饮食记录麻烦，难以长期坚持
- 食物热量估算困难，容易低估摄入
- 体重短期波动容易造成焦虑
- 不知道如何根据体重变化调整饮食

FitAgent 希望通过 AI Agent 的方式，把饮食记录、热量估算、趋势分析和每日建议整合到一个简单的网页应用中。

## 当前架构

- React + Vite 构建前端页面
- Recharts 实现体重和热量趋势可视化
- localStorage 实现前端本地数据保存
- FastAPI 提供饮食分析接口
- Netlify 部署前端
- Render 部署后端
- 前端通过环境变量 VITE_API_BASE_URL 调用线上后端

## 技术栈

- React
- Vite
- JavaScript
- CSS

## 已实现功能

- 饮食文本输入
- 后端接口分析饮食内容
- 估算摄入热量
- 返回饮食建议
- 识别常见食物关键词
- 体重记录新增、删除
- 饮食记录新增、删除
- Dashboard 动态展示今日摄入、今日体重、趋势图
- 支持线上前后端联调

## 项目亮点

- 使用 React + Vite 构建前端应用
- 使用 Recharts 实现趋势可视化
- 使用 localStorage 实现前端本地数据持久化
- 通过规则函数模拟 AI Agent 的建议生成逻辑
- 项目具备继续接入 FastAPI 后端和 LLM API 的扩展空间

## 后续计划

- 接入后端 API
- 接入 AI 模型进行饮食文本解析
- 添加数据库保存饮食和体重记录
- 添加真实图表展示
- 增加体重趋势预测功能

## API 示例

### POST /api/analyze-meal

Request:
```json
{
  "text": "晚上吃了炸鸡、奶茶和米饭"
}
```

Response:

```json
{
  "raw_text": "晚上吃了炸鸡、奶茶和米饭",
  "matched_items": [
    {
      "keyword": "米饭",
      "calories": 200
    },
    {
      "keyword": "炸鸡",
      "calories": 650
    },
    {
      "keyword": "奶茶",
      "calories": 450
    }
  ],
  "total_calories": 1300,
  "summary": "本餐热量偏高，建议下一餐减少油炸食物、含糖饮品和高油主食。"
}
```

- ## 项目截图

![Dashboard](./docs/dashboard.png)
