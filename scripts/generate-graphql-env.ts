import { generateOutput } from '@gql.tada/cli-utils';

generateOutput({
  output: './src/~graphql-env.d.ts',
  disablePreprocessing: false,
  tsconfig: undefined,
});
