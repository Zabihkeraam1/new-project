import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [response, setResponse] = useState('')
  const handleClick = (e:React.FormEvent)=>{
    e.preventDefault()
    console.log('Button clicked: ', import.meta.env.VITE_API_URL)
    axios.get(`https://${import.meta.env.VITE_API_URL}/api`).then(res=>{
      setResponse(res.data.message)
    })
    console.log(response)
  }
  const send = (e:React.FormEvent)=>{
    e.preventDefault()
    console.log('Button clicked: ', import.meta.env.VITE_API_URL)
    axios.get("https://d38re46utdbu32.cloudfront.net/api").then(res=>{
      setResponse(res.data.message)
    })
    console.log(response)
  }
  return (
    <>
      <h1>React App</h1>
      <div className="card">
        <button onClick={handleClick}>
          Send request
        </button>
        <button onClick={send}>
          Send
        </button>
        <p>
          {response}
        </p>
      </div>
    </>
  )
}

export default App
