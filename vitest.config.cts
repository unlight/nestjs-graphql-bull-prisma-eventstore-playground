import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vitest-tsconfig-paths';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [tsconfigPaths(), swc.vite()],
  test: {
    fileParallelism: false,
    environment: 'node',
    include: ['**/*.e2e-spec.ts'],
    reporters: 'dot',
  },
});
