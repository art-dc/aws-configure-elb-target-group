import { info, getInput, setOutput, setFailed } from "@actions/core";

import {
  describeTargetGroup,
  configureTargetGroup,
  ConfigureTargetGroupInputs,
} from "./target-group-management";

export async function run() {
  const name = getInput("name");

  let targetGroup = await configureTargetGroup({
    name,
    vpcId: getInput("vpc-id") || null,
    protocol: getInput("protocol") || null,
    port: parseInt(getInput("port")) || null,
    targetType: getInput("target-type") || null,
    healthCheckPath: getInput("health-check-path") || null,
    healthCheckProtocol: getInput("health-check-protocol") || null,
    healthCheckHttpCode: getInput("health-check-http-code") || null,
  } as ConfigureTargetGroupInputs);

  const arn = targetGroup?.TargetGroupArn;

  info(`Target group ARN: ${arn}`);
  setOutput("target-group-arn", arn);

  return 0;
}
