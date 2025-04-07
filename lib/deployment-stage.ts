import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stage } from 'aws-cdk-lib';
import { CloudTrailStack } from './cloudtrialupdated';
import { EventBusDestinationStack } from './eventbusdestination';
import { EventBusStack } from './eventbussrcupdated';

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    if (props?.env?.account === '156041406847') {
      new EventBusDestinationStack(this, 'EventBusDestinationStack', { env: props.env });
      //new GrafanaCdkStack(this, 'GrafanaCdkStack', { env: props.env });
    } else {
      new CloudTrailStack(this, 'CloudTrailStack', { env: props?.env ?? {} });  
      new EventBusStack(this, 'EventBusStack', { env: props?.env ?? {} });
      
    }
  }
}
