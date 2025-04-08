import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
// Removed duplicate import of lambda
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Construct } from 'constructs';
import { ASSET_FILE, LAYER_SOURCE_DIR } from '@aws-cdk/asset-kubectl-v20';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3_assets from 'aws-cdk-lib/aws-s3-assets';
import { FileSystem } from 'aws-cdk-lib';

export class EksYamlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ Use AWS-provided prebuilt kubectl Lambda layer (region: us-east-1)
    const kubectlLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'KubectlLayer',
      'arn:aws:lambda:us-east-1:141502667606:layer:kubectl:1'
    );

    // ✅ Import existing EKS cluster and attach kubectl layer
    const cluster = eks.Cluster.fromClusterAttributes(this, 'MyEksCluster', {
      clusterName: 'eksdemo',
      kubectlRoleArn: 'arn:aws:iam::820186421740:role/kubectl_role',
      kubectlLayer,
    });

    // ✅ Ensure 'otel' namespace exists
    const namespaceResource = new eks.KubernetesManifest(this, 'OtelNamespace', {
      cluster,
      manifest: [
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: 'otel' },
        },
      ],
    });

    // ✅ Load and parse manifest file
    const manifestPath = path.resolve(process.cwd(), 'manifests/combined.yaml');
    const yamlContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = yaml.loadAll(yamlContent) as Record<string, any>[];

    if (!manifest || manifest.length === 0) {
      throw new Error('combined.yaml is empty or invalid.');
    }

    // ✅ Inject namespace for all resources except the Namespace itself
    manifest.forEach((resource) => {
      if (resource?.kind !== 'Namespace') {
        resource.metadata = resource.metadata || {};
        resource.metadata.namespace = 'otel';
      }
    });

    // ✅ Apply the combined.yaml manifest
    const combinedManifest = new eks.KubernetesManifest(this, 'CombinedManifest', {
      cluster,
      manifest,
    });

    // ✅ Ensure namespace is created before other resources
    combinedManifest.node.addDependency(namespaceResource);
  }
}



declare const fn: lambda.Function;
const asset = new s3_assets.Asset(this, 'layer-asset', {
  path: ASSET_FILE,
  assetHash: FileSystem.fingerprint(LAYER_SOURCE_DIR),
});

fn.addLayers(new lambda.LayerVersion(this, 'KubectlLayer', {
  code: lambda.Code.fromBucket(asset.bucket, asset.s3ObjectKey),
  description: '/opt/kubectl/kubectl and /opt/helm/helm',
}));