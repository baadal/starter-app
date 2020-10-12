import done from './utils/api-env';
import { apiServer } from './api-server';

void (async () => {
  await apiServer();

  process.on('uncaughtException', err => {
    console.error(`[uncaughtException] API Server:`, err);
  });

  if (!done) {
    // ensure side-effect and avoid tree-sahaking
    console.log('~ starter/api/utils/api-env.ts');
  }
})();
