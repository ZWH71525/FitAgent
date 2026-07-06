import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import './App.css'

const initialWeightData = [
  { date: '7/1', weight: 59.1 },
  { date: '7/2', weight: 58.9 },
  { date: '7/3', weight: 58.8 },
  { date: '7/4', weight: 58.7 },
  { date: '7/5', weight: 58.6 },
  { date: '7/6', weight: 58.4 },
]

const calorieData = [
  { date: '7/1', calories: 1680 },
  { date: '7/2', calories: 1520 },
  { date: '7/3', calories: 1610 },
  { date: '7/4', calories: 1480 },
  { date: '7/5', calories: 1550 },
  { date: '7/6', calories: 1450 },
]

const initialMealLogs = []

  function App() {
  const [page, setPage] = useState('dashboard')

  const [weightData, setWeightData] = useState(() => {
    const saved = localStorage.getItem('fitagent_weight_data')
    return saved ? JSON.parse(saved) : initialWeightData
  })

  useEffect(() => {
    localStorage.setItem('fitagent_weight_data', JSON.stringify(weightData))
  }, [weightData])

  const addWeightLog = (newLog) => {
    setWeightData([...weightData, newLog])
  }

  const [mealLogs, setMealLogs] = useState(() => {
  const saved = localStorage.getItem('fitagent_meal_logs')
  return saved ? JSON.parse(saved) : initialMealLogs
  })

  useEffect(() => {
    localStorage.setItem('fitagent_meal_logs', JSON.stringify(mealLogs))
  }, [mealLogs])

  const addMealLog = (newLog) => {
    setMealLogs([...mealLogs, newLog])
  }
  const deleteMealLog = (indexToDelete) => {
  setMealLogs(mealLogs.filter((_, index) => index !== indexToDelete))
  }

const deleteWeightLog = (indexToDelete) => {
  setWeightData(weightData.filter((_, index) => index !== indexToDelete))
}

  const resetDemoData = () => {
    setWeightData(initialWeightData)
    setMealLogs([])
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>FitAgent</h1>
        <p>AI 减脂饮食助手</p>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('meal')}>饮食记录</button>
        <button onClick={() => setPage('weight')}>体重记录</button>
        <button className="reset-button" onClick={resetDemoData}>  清空测试数据</button>
      </aside>

      <main className="main">
        {page === 'dashboard' && <Dashboard weightData={weightData} mealLogs={mealLogs} />}
        {page === 'meal' && <MealLog mealLogs={mealLogs} onAddMeal={addMealLog} onDeleteMeal={deleteMealLog} />}
        {page === 'weight' && <WeightLog weightData={weightData} onAddWeight={addWeightLog} onDeleteWeight={deleteWeightLog}/>}
      </main>
    </div>
  )
}

function Dashboard({ weightData, mealLogs }) {
  const todayCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0)
  const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : '--'
  const calorieChartData = mealLogs.length > 0
    ? mealLogs.map((item) => ({
      date: item.date,
      calories: item.calories,
    }))
  : calorieData
  const targetCalories = 1600
  const latestWeightChange =
    weightData.length >= 2
      ? weightData[weightData.length - 1].weight - weightData[weightData.length - 2].weight
      : 0
  const hasProtein = mealLogs.some((item) =>
    /鸡蛋|鸡胸肉|牛肉|鱼|虾|豆腐|豆浆|牛奶|酸奶/.test(item.rawText)
  )
  const hasHighCalorieFood = mealLogs.some((item) =>
  /炸鸡|奶茶|汉堡|薯条|披萨|蛋糕|烧烤|火锅/.test(item.rawText)
  )
  let dailySuggestion = '今天还没有饮食记录，可以先记录一餐，系统会根据摄入和体重变化生成建议。'

  if (todayCalories > 0) {
    if (todayCalories > targetCalories + 200 || hasHighCalorieFood) {
      dailySuggestion = '今天摄入热量偏高，建议晚餐减少高油高糖食物，优先选择蔬菜、优质蛋白和低脂主食。'
    } else if (todayCalories < targetCalories - 300) {
      dailySuggestion = '今天摄入热量偏低，减脂不建议长期过度节食。可以适当补充蛋白质和主食，避免影响代谢和训练状态。'
    } else {
      dailySuggestion = '今天热量控制比较稳定，建议继续保持，并关注 7 日体重趋势，不要被单日波动影响情绪。'
    }

    if (!hasProtein) {
      dailySuggestion += ' 另外，今天记录中蛋白质来源不明显，可以增加鸡蛋、鱼肉、鸡胸肉、豆腐或低脂奶。'
    }

    if (latestWeightChange > 0.3) {
      dailySuggestion += ' 今日体重略有上升，可能和水分、盐分、碳水摄入或称重时间有关，建议看长期趋势。'
    } else if (latestWeightChange < -0.3) {
      dailySuggestion += ' 今日体重下降较明显，注意不要因为短期下降就继续过度压低热量。'
    }
  }
  return (
    <section>
      <h2>今日概览</h2>

      <div className="cards">
        <div className="card"><span>今日摄入</span><strong>{todayCalories} kcal</strong></div>
        <div className="card"><span>目标摄入</span><strong>1600 kcal</strong></div>
        <div className="card"><span>今日体重</span><strong>{latestWeight} kg</strong></div>
        <div className="card"><span>目标体重</span><strong>55.0 kg</strong></div>
      </div>

      <div className="panel">
        <h3>体重趋势</h3>
        <div className="chart">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 0.3', 'dataMax + 0.3']} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                name="体重 kg"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <h3>热量摄入趋势</h3>
        <div className="chart">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={calorieChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calories"
                name="摄入热量 kcal"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <h3>AI 每日建议</h3>
        <p>{dailySuggestion}</p>
      </div>
    </section>
  )
}

function MealLog({ mealLogs, onAddMeal, onDeleteMeal }) {
  const [mealText, setMealText] = useState('')

  const estimateCalories = (text) => {
    const rules = [
      { keyword: '鸡蛋', calories: 70 },
      { keyword: '豆浆', calories: 80 },
      { keyword: '拿铁', calories: 180 },
      { keyword: '米饭', calories: 200 },
      { keyword: '鸡胸肉', calories: 250 },
      { keyword: '沙拉', calories: 180 },
      { keyword: '牛肉', calories: 300 },
      { keyword: '面包', calories: 220 },
      { keyword: '炸鸡', calories: 650 },
      { keyword: '奶茶', calories: 450 },
      { keyword: '汉堡', calories: 500 },
      { keyword: '薯条', calories: 350 },
      { keyword: '披萨', calories: 600 },
      { keyword: '蛋糕', calories: 400 },
    ]

    const total = rules.reduce((sum, item) => {
      return text.includes(item.keyword) ? sum + item.calories : sum
    }, 0)

    return total || 300
  }

  const handleAnalyze = () => {
    if (!mealText) {
      alert('请先输入饮食内容')
      return
    }

    const newLog = {
      date: new Date().toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }),
      rawText: mealText,
      calories: estimateCalories(mealText),
    }

    onAddMeal(newLog)
    setMealText('')
  }

  return (
    <section>
      <h2>饮食记录</h2>

      <textarea
        value={mealText}
        onChange={(event) => setMealText(event.target.value)}
        placeholder="例如：早餐吃了一个鸡蛋和一杯无糖豆浆，中午吃了一份鸡胸肉沙拉。"
      />

      <button className="primary" onClick={handleAnalyze}>分析饮食</button>

      <div className="panel">
        <h3>饮食记录</h3>
        {mealLogs.length === 0 ? (
          <p>还没有饮食记录，先输入一条试试。</p>
        ) : (
          <ul>
            {mealLogs.map((item, index) => (
              <li key={index} className="record-item">
                <span>
                  {item.date}：{item.rawText}，估算热量 {item.calories} kcal
                </span>
                <button className="delete-button" onClick={() => onDeleteMeal(index)}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function WeightLog({ weightData, onAddWeight, onDeleteWeight }) {
  const [date, setDate] = useState('')
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    if (!date || !weight) {
      alert('请填写日期和体重')
      return
    }

    onAddWeight({
      date,
      weight: Number(weight),
      note,
    })

    setDate('')
    setWeight('')
    setNote('')
  }

  return (
    <section>
      <h2>体重记录</h2>

      <div className="form">
        <input
          value={date}
          onChange={(event) => setDate(event.target.value)}
          placeholder="日期：7/7"
        />
        <input
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="今日体重：58.3"
        />
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="备注：今天早上空腹称重"
        />
        <button className="primary" onClick={handleSubmit}>保存记录</button>
      </div>

      <div className="panel">
        <h3>最近体重趋势</h3>
        <div className="chart">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 0.3', 'dataMax + 0.3']} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                name="体重 kg"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p>最近 7 天平均体重下降，趋势正常。单日波动可能与饮水、盐分和运动有关。</p>
      </div>

      <div className="panel">
        <h3>历史记录</h3>
        <ul>
          {weightData.map((item, index) => (
            <li key={index} className="record-item">
              <span>
                {item.date}，{item.weight} kg {item.note ? `，${item.note}` : ''}
              </span>
              <button className="delete-button" onClick={() => onDeleteWeight(index)}>
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default App