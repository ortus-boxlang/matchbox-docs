---
title: AWS Lambda
description: Run BoxLang on AWS Lambda with the MatchBox runtime: the handler contract, routing, Application.bx lifecycle, deploy flags and AWS CLI setup.
---

# AWS Lambda

MatchBox runs on Lambda's `provided.al2023` custom runtime. The package is a `bootstrap` executable plus your `.bx` files. On each invocation the runtime loads a BoxLang class and calls its `run` method with the event.

See the [single-file Lambda example](../examples/aws_lambda_single_file/README.md) for a complete project.

## Handler contract

```
class {
    function run( event, context, response ) {
        response.statusCode = 200;
        response.body = { "message": "Hello" };
    }
}
```

| Argument | Contents |
| :--- | :--- |
| `event` | The invocation event JSON converted to BoxLang structs, arrays and simple values. |
| `context` | The Lambda context object, below. |
| `response` | A struct with `statusCode` (200), `headers`, `cookies` (empty array), `body` (empty string) and `isBase64Encoded`. Change it in place, or return a value. |

The runtime builds the HTTP-style result from the response:

- If `run` returns a struct that has any of `statusCode`, `headers`, `cookies`, `body` or `isBase64Encoded`, that struct is the response.
- If `run` returns any other value except `null`, it replaces `response.body`.
- A string body is sent as is. Binary data is Base64-encoded and `isBase64Encoded` is set to `true`. Any other value is serialized as JSON.
- `headers` starts as `Content-Type: application/json` and `Access-Control-Allow-Origin: *`. If you assign a new `headers` struct, **those defaults are not added**, so the CORS header is gone too. An empty `headers` struct at the end gets the two defaults back.

### Context

| Method | Returns |
| :--- | :--- |
| `getAwsRequestId()` | The request id from the Runtime API. `local-request` in a local invoke. |
| `getFunctionName()`, `getFunctionVersion()`, `getInvokedFunctionArn()` | From `AWS_LAMBDA_FUNCTION_NAME`, `AWS_LAMBDA_FUNCTION_VERSION` and the invocation headers. |
| `getMemoryLimitInMB()` | From `AWS_LAMBDA_FUNCTION_MEMORY_SIZE`. |
| `getLogGroupName()`, `getLogStreamName()` | From `AWS_LAMBDA_LOG_GROUP_NAME` and `AWS_LAMBDA_LOG_STREAM_NAME`. |
| `getRemainingTimeInMillis()` | Time to the invocation deadline. A local invoke always reports 30000. |
| `getLogger().log( message, [level="INFO"] )` | Writes `[LEVEL] message` to standard output. |
| `getClientContext()`, `getIdentity()` | An empty struct. |

## Routing to classes

The class that runs is chosen from the request path:

1. The path comes from `requestContext.http.path`, else `rawPath` (when `requestContext.domainName` exists), else `requestContext.resourcePath`, else `path`.
2. The first path segment is converted to PascalCase, splitting on characters that are not letters or digits: `/hello-world/x` becomes `HelloWorld.bx`.
3. If that file exists in the package root or in `src/main/bx/`, it handles the request. Otherwise, and for `/` or an event with no path, `Lambda.bx` handles it.

`Lambda.bx` is looked up in the package root, then in `src/main/bx/`. Without it the runtime stops at startup with `Lambda.bx not found`.

## Application.bx lifecycle

An `Application.bx` in the package root or in `src/main/bx/` is optional. On **every invocation** the runtime creates a new VM, runs `Application.bx`, constructs it and calls its hooks. Nothing is cached between invocations, so `onApplicationStart` runs every time and the startup cost is paid per request.

| Hook | When | Arguments |
| :--- | :--- | :--- |
| `onApplicationStart()` | Before the handler class is loaded. | none |
| `onRequestStart( path, event, context )` | Before `run`. `path` is the file path of the handler class. | |
| `onRequestEnd( path, event, context )` | After `run`, also after a failure. | |
| `onError( error, "", event, context )` | When `run` throws. `error` is the error text. | |

Hooks you do not define are skipped. After a failure the runtime posts `{ "errorMessage": ..., "errorType": "MatchBoxLambdaError" }` to the Runtime API error endpoint.

## Local invoke

```sh
matchbox lambda invoke Lambda.bx --event event.json
matchbox lambda invoke ./my-project --event event.json
```

The argument is a `.bx` file or a project directory. The command runs the same code as Lambda, prints the response as JSON, and uses the local defaults above for the context.

## Deploy

```sh
matchbox lambda deploy Lambda.bx \
  --function matchbox-hello \
  --role arn:aws:iam::123456789012:role/matchbox-lambda-execution \
  --profile matchbox-dev \
  --region us-east-1 \
  --public \
  --bootstrap /path/to/bootstrap
```

Put the path to the file or project right after `deploy`, before any flag. The command takes the first argument that does not start with `--` as the path.

| Flag | Meaning |
| :--- | :--- |
| `--function <name>` | Required. Function name. |
| `--bootstrap <file>` | Required. A Linux executable for the chosen architecture. It is stored in the zip as `bootstrap`. |
| `--role <arn>` | Execution role. Required when the function does not exist yet. |
| `--arch arm64\|x86_64` | Architecture for a new function and for the bootstrap you supply. Default `arm64`. |
| `--out <file>` | Where to write the zip. Default `target/lambda/<function>.zip`. |
| `--memory <MB>` | Memory size, applied with `update-function-configuration`. |
| `--timeout <seconds>` | Timeout, applied with `update-function-configuration`. |
| `--profile <name>`, `--region <region>` | Passed to every `aws` call. |
| `--public` | Create or update a Function URL with auth type `NONE`. Anyone can call it. Adds the `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction` permissions for principal `*`. |
| `--url` | Create or update a Function URL with `AWS_IAM` auth. Callers must sign requests. |

Use at most one of `--public` and `--url`. Without either, no Function URL is touched. The URL is printed when one is configured.

The command writes the zip, checks for the function with `lambda get-function`, then either runs `update-function-code` or, when it does not exist, `create-function` with `--runtime provided.al2023 --handler bootstrap`. `--memory` and `--timeout` are applied afterwards when given. Memory and timeout are numbers up to 65535.

Supply the Lambda runtime executable with `--bootstrap`; the deploy command does not build it for you.

### Package layout

The zip stores files without compression. `bootstrap` has mode 0755.

| Input | Contents of the zip |
| :--- | :--- |
| A single `.bx` file | The file as `Lambda.bx`, every other `.bx` file in the same directory (not subdirectories), `boxlang.json` and `boxlang_modules/` from that directory. |
| A project directory with `src/main/bx/` | The whole `src/main/bx/` tree at the zip root, `src/resources/boxlang.json` or `boxlang.json`, and `src/resources/boxlang_modules/` or `boxlang_modules/`. |
| A project directory without it | The `.bx` files in the directory root plus the same `boxlang.json` and `boxlang_modules/` rules. |

Only files ending in `.bx` are picked up outside `boxlang_modules/`.

### Building the bootstrap

The `bootstrap` binary is the `matchbox_lambda_runner` crate. The release workflow does not publish it. Build it from the MatchBox source tree:

```sh
cargo build --release -p matchbox_lambda_runner
# result: target/release/matchbox_lambda_runner
```

For a different architecture add `--target` with the matching Rust target, such as `aarch64-unknown-linux-gnu` for `arm64`, and the linker that target needs. Pass the resulting file to `--bootstrap`.

At start the binary reads these variables:

| Variable | Use |
| :--- | :--- |
| `AWS_LAMBDA_RUNTIME_API` | Required. Host and port of the Runtime API. |
| `LAMBDA_TASK_ROOT` | Directory with the package. Default `/var/task`. |
| `AWS_LAMBDA_FUNCTION_NAME`, `AWS_LAMBDA_FUNCTION_VERSION`, `AWS_LAMBDA_FUNCTION_MEMORY_SIZE`, `AWS_LAMBDA_LOG_GROUP_NAME`, `AWS_LAMBDA_LOG_STREAM_NAME` | Filled into the context. |

It then loops: fetch the next invocation, run it, post the response or the error.

## AWS account setup

These steps prepare an AWS account and machine for `matchbox lambda deploy`.

### 1. Install AWS CLI v2

`matchbox lambda deploy` shells out to the `aws` CLI, so install AWS CLI version 2 and verify it is on your `PATH`.

On macOS, the official installer is:

```bash
curl -o /tmp/AWSCLIV2.pkg https://awscli.amazonaws.com/AWSCLIV2.pkg
sudo installer -pkg /tmp/AWSCLIV2.pkg -target /
aws --version
```

Expected shape:

```text
aws-cli/2.x.x ...
```

AWS CLI v1 and v2 both use the `aws` command name. If `aws --version` shows v1, upgrade or fix your `PATH` before testing deploys.

### 2. Configure Credentials

Recommended: use IAM Identity Center / SSO if your AWS account supports it.

```bash
aws configure sso --profile matchbox-dev
aws sso login --profile matchbox-dev
```

The wizard asks for:

- SSO start URL
- SSO region
- AWS account
- permission set / role
- default region
- output format

Use `json` for output format.

If you are using access keys instead of SSO:

```bash
aws configure --profile matchbox-dev
```

This writes config under:

```text
~/.aws/config
~/.aws/credentials
```

Do not use root account credentials.

### 3. Pick a Lambda region

Choose a region that supports Lambda Function URLs. For example:

```bash
export AWS_PROFILE=matchbox-dev
export AWS_REGION=us-east-1
```

Or pass them to the deploy command:

```bash
matchbox lambda deploy Lambda.bx \
  --profile matchbox-dev \
  --region us-east-1 \
  ...
```

### 4. Verify your identity

Run:

```bash
aws sts get-caller-identity \
  --profile matchbox-dev \
  --region us-east-1
```

You should see JSON with:

```json
{
  "UserId": "...",
  "Account": "123456789012",
  "Arn": "..."
}
```

Keep the `Account` value handy.

### 5. Create a Lambda execution role

Creating a function requires an existing Lambda execution role ARN. The deploy command does not create IAM roles.

Create a trust policy:

```bash
cat > /tmp/matchbox-lambda-trust-policy.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
JSON
```

Create the role:

```bash
aws iam create-role \
  --role-name matchbox-lambda-execution \
  --assume-role-policy-document file:///tmp/matchbox-lambda-trust-policy.json \
  --profile matchbox-dev \
  --region us-east-1
```

Attach the basic CloudWatch Logs policy:

```bash
aws iam attach-role-policy \
  --role-name matchbox-lambda-execution \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --profile matchbox-dev \
  --region us-east-1
```

Get the role ARN:

```bash
aws iam get-role \
  --role-name matchbox-lambda-execution \
  --query 'Role.Arn' \
  --output text \
  --profile matchbox-dev \
  --region us-east-1
```

Save that ARN. It will look like:

```text
arn:aws:iam::123456789012:role/matchbox-lambda-execution
```

IAM role propagation can take a few seconds. If Lambda create fails with a role-assumption error immediately after creating the role, wait briefly and retry.

### 6. Permissions your AWS principal needs

The AWS profile you use for deploys needs permissions roughly equivalent to:

- `lambda:GetFunction`
- `lambda:CreateFunction`
- `lambda:UpdateFunctionCode`
- `lambda:UpdateFunctionConfiguration`
- `lambda:CreateFunctionUrlConfig`
- `lambda:GetFunctionUrlConfig`
- `lambda:AddPermission`
- `iam:PassRole` for the execution role ARN

If you create the role yourself with the commands above, your principal also needs:

- `iam:CreateRole`
- `iam:AttachRolePolicy`
- `iam:GetRole`

### Manual AWS CLI equivalents

`matchbox lambda deploy` runs AWS CLI calls like these:

```bash
aws lambda create-function \
  --function-name matchbox-hello \
  --runtime provided.al2023 \
  --handler bootstrap \
  --architectures arm64 \
  --role arn:aws:iam::123456789012:role/matchbox-lambda-execution \
  --zip-file fileb://target/lambda/matchbox-hello.zip \
  --profile matchbox-dev \
  --region us-east-1
```

```bash
aws lambda update-function-code \
  --function-name matchbox-hello \
  --zip-file fileb://target/lambda/matchbox-hello.zip \
  --profile matchbox-dev \
  --region us-east-1
```

```bash
aws lambda create-function-url-config \
  --function-name matchbox-hello \
  --auth-type NONE \
  --profile matchbox-dev \
  --region us-east-1
```

```bash
aws lambda add-permission \
  --function-name matchbox-hello \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE \
  --profile matchbox-dev \
  --region us-east-1
```

```bash
aws lambda get-function-url-config \
  --function-name matchbox-hello \
  --query FunctionUrl \
  --output text \
  --profile matchbox-dev \
  --region us-east-1
```

## Sources

- AWS CLI v2 install guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- AWS CLI SSO configuration: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
- AWS CLI prerequisites and credential guidance: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html
- Lambda Function URLs: https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html
- AWS CLI `create-function-url-config`: https://docs.aws.amazon.com/cli/latest/reference/lambda/create-function-url-config.html
- AWS CLI `add-permission`: https://docs.aws.amazon.com/cli/latest/reference/lambda/add-permission.html
