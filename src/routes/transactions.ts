import { knex } from '@/database'
import { checkIfSessionIdExists } from '@/middlewares'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

const TRANSACTIONS_TABLE_NAME = 'transactions' as const

export async function transactionsRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/',
    preHandler: [checkIfSessionIdExists],
    async handler(req) {
      const sessionId = req.cookies.sessionId

      const transactions = await knex(TRANSACTIONS_TABLE_NAME)
        .select()
        .where('session_id', sessionId)

      return { data: transactions }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: z.object({
        id: z.uuid(),
      }),
    },
    preHandler: [checkIfSessionIdExists],

    async handler(req) {
      const { id } = req.params
      const sessionId = req.cookies.sessionId

      const transaction = await knex(TRANSACTIONS_TABLE_NAME)
        .select()
        .where({ id, session_id: sessionId })
        .first()

      return transaction
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/summary',
    preHandler: [checkIfSessionIdExists],

    async handler(req) {
      const sessionId = req.cookies.sessionId

      const summary = await knex(TRANSACTIONS_TABLE_NAME)
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      body: z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      }),
    },
    preHandler: [],
    async handler(req, reply) {
      const { title, amount, type } = req.body

      let sessionId = req.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }

      const [transaction] = await knex(TRANSACTIONS_TABLE_NAME)
        .insert({
          id: randomUUID(),
          title,
          amount: type === 'credit' ? amount : amount * -1,
          session_id: sessionId,
        })
        .returning('id')

      return reply.status(201).send(transaction)
    },
  })
}
