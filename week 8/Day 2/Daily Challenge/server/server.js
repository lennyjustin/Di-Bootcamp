import express from 'express'

const app = express()
const port = Number(process.env.PORT || 3002)

app.use(express.json())

app.get('/api/hello', (_request, response) => {
  response.json({ message: 'Hello From Express' })
})

app.post('/api/world', (request, response) => {
  console.log('Received POST body:', request.body)

  const { message } = request.body
  if (typeof message !== 'string') {
    return response.status(400).json({ error: 'A message string is required.' })
  }

  response.json({
    message: `I received your POST request. This is what you sent me: ${message}`,
  })
})

app.listen(port, () => {
  console.log(`Daily Challenge API listening at http://localhost:${port}`)
})
