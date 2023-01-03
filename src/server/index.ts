import 'dotenv/config';
import fastify from 'fastify';
import { routes } from './routes';

const server = fastify({ logger: process.env.NODE_ENV === 'development' });

routes(server);

void new Promise(async () => {
  try {
    const port = Number(process.env.SERVER_PORT) || 3000;
    await server.listen({ port });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
});
