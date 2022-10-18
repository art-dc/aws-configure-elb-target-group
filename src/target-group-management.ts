import ECS, {
  TargetGroup,
  CreateTargetGroupInput,
  DescribeTargetGroupsInput,
} from "aws-sdk/clients/elbv2";

export interface ConfigureTargetGroupInputs {
  name: string;
  port?: number;
  vpcId?: string;
  protocol?: string;
  targetType?: string;
  healthCheckPath?: string;
  healthCheckProtocol?: string;
  healthCheckHttpCode?: string;
}

function getClient(): ECS {
  return new ECS({
    customUserAgent: "icalia-actions/aws-action",
    region: process.env.AWS_DEFAULT_REGION,
  });
}

export async function describeTargetGroup(
  name: string
): Promise<TargetGroup | undefined> {
  const ecs = getClient();

  try {
    const response = await ecs
      .describeTargetGroups({ Names: [name] } as DescribeTargetGroupsInput)
      .promise();

    console.log(`all targetgroups with name ${name}:`, response.TargetGroups);

    return response.TargetGroups?.pop();
  } catch (error) {
    console.log(`no targetgroups with name ${name}.`);
    return;
  }
}

export async function createTargetGroup(
  inputs: ConfigureTargetGroupInputs
): Promise<TargetGroup | undefined> {
  const ecs = getClient();
  const matcher = inputs.healthCheckHttpCode
    ? { HttpCode: inputs.healthCheckHttpCode }
    : undefined;
  const { TargetGroups } = await ecs
    .createTargetGroup({
      Name: inputs.name,
      Port: inputs.port,
      VpcId: inputs.vpcId,
      Protocol: inputs.protocol,
      TargetType: inputs.targetType,
      HealthCheckPath: inputs.healthCheckPath,
      HealthCheckProtocol: inputs.healthCheckProtocol,
      Matcher: matcher,
    } as CreateTargetGroupInput)
    .promise();

  console.log("createTargetGroup response:", TargetGroups);

  return TargetGroups?.pop();
}

export async function configureTargetGroup(
  inputs: ConfigureTargetGroupInputs
): Promise<TargetGroup | undefined> {
  const { name } = inputs;
  let targetGroup = await describeTargetGroup(name);
  if (!targetGroup) targetGroup = await createTargetGroup(inputs);
  return targetGroup;
}
