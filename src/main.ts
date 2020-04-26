import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapater';
import * as cluster from 'cluster';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  await app.listen(3000);
  console.log(`SERVER (${process.pid}) IS RUNNING ON `, 3000);
}

const numCPUs = os.cpus().length;
if (cluster.isMaster) {
  console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  bootstrap();
}
