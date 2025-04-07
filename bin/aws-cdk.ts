import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new PipelineStack(app, 'MultiAccountPipeline', {
  env: { account: '156041406847', region: 'us-east-1' }
});


