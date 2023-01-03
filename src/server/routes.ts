import fs from 'node:fs';
import { FastifyInstance } from 'fastify';

export function routes(server: FastifyInstance) {
  server.get('/data/:provider/:domain/:range', async (request, reply) => {
    const { provider, domain, range } = request.params as {
      provider: string;
      domain: string;
      range: string;
    };

    try {
      const data = fs.readFileSync(`./data/${provider}/${domain}/${range}.json`, 'utf-8');
      reply.send(JSON.parse(data));
    } catch (error) {
      reply.status(404).send();
    }
  });
}
