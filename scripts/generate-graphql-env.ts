import { generateOutput } from '@gql.tada/cli-utils';

generateOutput({
  disablePreprocessing: false,
  output: './src/~graphql-env.d.ts',
  tsconfig: undefined,
});
