import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z.coerce.number().default(3333),
  DATABSE_URL: z.string()
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    '💀 Invalid enviroment variables!',
    JSON.stringify(z.treeifyError(_env.error), null, 2)
  )

  throw new Error('Invalid enviroment variables.')
}

export const env = _env.data
