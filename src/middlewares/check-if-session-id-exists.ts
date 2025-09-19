import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkIfSessionIdExists(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
