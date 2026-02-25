const express = require('express')
const { exec } = require('child_process')
const app = express()
app.use(express.json())

const SECRET = process.env.BRIDGE_SECRET || 'aria-bridge-2024-secret'

const ALLOWED = [
  'ls','pwd','echo','cat','node','python3','curl','wget',
  'git','npm','df','free','ps','whoami','date','uname',
  'mkdir','touch','cp','mv','head','tail','grep','find',
  'ping','nohup','bash','sh'
]

app.post('/run', (req, res) => {
  const auth = req.headers['authorization']
  if (auth !== `Bearer ${SECRET}`) return res.status(401).json({ error: 'Unauthorized' })
  const { command } = req.body
  if (!command) return res.status(400).json({ error: 'No command' })
  const cmd = command.trim().split(/\s+/)[0]
  if (!ALLOWED.includes(cmd)) return res.status(403).json({ error: `Command not allowed: ${cmd}` })

  exec(command, { timeout: 25000, maxBuffer: 1024 * 512 }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout || stderr || error?.message || 'empty output'
    })
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'online', time: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`ARIA Bridge running on port ${PORT}`))
