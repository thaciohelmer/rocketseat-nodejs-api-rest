import { app } from '@/app'
import supertest from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    execSync('pnpm db:rollback --all')
    execSync('pnpm db:migrate')
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new transaction', () => {
    supertest(app.server)
      .post('/api/transactions')
      .send({
        title: 'New Transaction',
        amount: 200,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/api/transactions')
      .send({
        title: 'New Transaction',
        amount: 200,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    const listaTransactionsResponse = await supertest(app.server)
      .get('/api/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listaTransactionsResponse.body.data).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 200,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/api/transactions')
      .send({
        title: 'New Transaction',
        amount: 200,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    const listaTransactionsResponse = await supertest(app.server)
      .get('/api/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listaTransactionsResponse.body.data[0].id

    const getTransactionResponse = await supertest(app.server)
      .get(`/api/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 200,
      })
    )
  })

  it('should be able to get the summary', async () => {
    const createCreditTransactionResponse = await supertest(app.server)
      .post('/api/transactions')
      .send({
        title: 'New Transaction',
        amount: 300,
        type: 'credit',
      })

    const cookies = createCreditTransactionResponse.get('Set-Cookie') ?? []

    await supertest(app.server)
      .post('/api/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 200,
        type: 'debit',
      })

    const listaTransactionsResponse = await supertest(app.server)
      .get('/api/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(listaTransactionsResponse.body.summary).toEqual({
      amount: 100,
    })
  })
})
