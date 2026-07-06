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

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>FitAgent</h1>
        <p>AI 减脂饮食助手</p>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('meal')}>饮食记录</button>
        <button onClick={() => setPage('weight')}>体重记录</button>
      </aside>

      <main className="main">
        {page === 'dashboard' && <Dashboard weightData={weightData} />}
        {page === 'meal' && <MealLog />}
        {page === 'weight' && <WeightLog weightData={weightData} onAddWeight={addWeightLog} />}
      </main>
    </div>
  )
}

function Dashboard({ weightData }) {
  return (
    <section>
      <h2>今日概览</h2>

      <div className="cards">
        <div className="card"><span>今日摄入</span><strong>1450 kcal</strong></div>
        <div className="card"><span>目标摄入</span><strong>1600 kcal</strong></div>
        <div className="card"><span>今日体重</span><strong>58.4 kg</strong></div>
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
            <LineChart data={calorieData}>
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
        <p>今天热量控制较好，但蛋白质摄入略低。建议晚餐增加鸡蛋、鱼肉、豆制品或低脂奶。</p>
      </div>
    </section>
  )
}

function MealLog() {
  return (
    <section>
      <h2>饮食记录</h2>
      <textarea placeholder="例如：早餐吃了一个鸡蛋和一杯无糖豆浆，中午吃了一份鸡胸肉沙拉。" />
      <button className="primary">分析饮食</button>

      <div className="panel">
        <h3>AI 解析结果</h3>
        <ul>
          <li>鸡蛋，1 个，约 70 kcal</li>
          <li>无糖豆浆，1 杯，约 80 kcal</li>
          <li>鸡胸肉沙拉，1 份，约 350 kcal</li>
        </ul>
        <strong>总热量：500 kcal</strong>
      </div>
    </section>
  )
}

function WeightLog({ weightData, onAddWeight }) {
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
            <li key={index}>
              {item.date}，{item.weight} kg {item.note ? `，${item.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default App