import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod'
import { transactionsRoutes } from './routes'

export const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCookie)

app.register(transactionsRoutes, { prefix: '/api/transactions' })

app.get('/health', async () => {
  return 'OK'
})
