import express from 'express'
import { createUsers } from './components/users/createUsers'
import { handler } from './helpers/handler'


const app = express()

app.post('/accounts', handler((req, res) => createUsers(req.body.users)))
// app.get('/accounts/:id', handler(getAccount))
// app.put('/accounts/:id', handler(updateAccount))
// app.post('/transfers', handler(createTransfers))

const port = 3000
app.listen(port, () => console.log(`🚀 Listening at http://localhost:${port}`))
