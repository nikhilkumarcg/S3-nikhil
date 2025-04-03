import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export class EksYamlStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import an existing EKS cluster with kubectl role ARN
    const cluster = eks.Cluster.fromClusterAttributes(this, 'MyEksCluster', {
      clusterName: 'eksdemo1',
      kubectlRoleArn: 'arn:aws:iam::820186421740:role/kubectl_role', // Replace with actual role ARN
    });

    // Directory containing YAML files
    const manifestDir = 'manifests';

    // Read all YAML files in the directory
    const files = fs.readdirSync(manifestDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    // Apply manifests in batches to avoid rate limits
    files.forEach((file, index) => {
      const filePath = path.join(manifestDir, file);
      const yamlContent = fs.readFileSync(filePath, 'utf8');
      const manifest = yaml.loadAll(yamlContent) as Record<string, any>[];

      new eks.KubernetesManifest(this, `Manifest-${file}-${index}`, {
        cluster,
        manifest,
      });

      console.log(`Applying manifest: ${file}`);
    });
  }
}
