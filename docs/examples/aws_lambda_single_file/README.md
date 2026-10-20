---
title: Single-file AWS Lambda
description: The smallest MatchBox Lambda: one Lambda.bx class, a local invoke and a deploy command.
---

# Single-File AWS Lambda

This example is the smallest MatchBox Lambda shape:

```text
Lambda.bx
event.json
```

`Lambda.bx` defines a class with:

```boxlang
function run(event, context, response)
```

The runtime passes the raw AWS Lambda event into `event`, an AWS-style context object into `context`, and a mutable Lambda proxy response struct into `response`. The handler here sets its own `headers` struct, which includes CORS headers, so the runtime's default headers are not added. The [AWS Lambda guide](../../building-and-deploying/aws-lambda-aws-cli-setup.md) describes the full contract, class routing and the `Application.bx` hooks.

## Local Invoke

From this directory:

```bash
matchbox lambda invoke Lambda.bx --event event.json
```

`event.json` is a Function URL style event with `name=Lambda` in the query string. The response:

```json
{
  "body": "{\"message\":\"Hello from Lambda\",\"path\":\"/\",\"requestId\":\"local-request\"}",
  "cookies": [],
  "headers": {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  },
  "isBase64Encoded": false,
  "statusCode": 200
}
```

A local invoke reports `local-request` as the request id.

## AWS Setup

Before deploying, follow the [AWS account setup](../../building-and-deploying/aws-lambda-aws-cli-setup.md#aws-account-setup). You need:

- AWS CLI v2
- a configured AWS profile
- a region
- an existing Lambda execution role ARN

## Build the bootstrap

The Lambda runtime executable is not part of the CLI. Build it from the MatchBox source tree for the architecture of your function (the default is `arm64`):

```bash
cargo build --release -p matchbox_lambda_runner --target aarch64-unknown-linux-gnu
```

The result is `target/aarch64-unknown-linux-gnu/release/matchbox_lambda_runner`. Building for another architecture needs that target installed and a linker for it.

## Deploy

```bash
matchbox lambda deploy Lambda.bx \
  --function matchbox-single-file-demo \
  --role arn:aws:iam::123456789012:role/matchbox-lambda-execution \
  --profile matchbox-dev \
  --region us-east-1 \
  --public \
  --bootstrap /path/to/matchbox_lambda_runner
```

Use `--public` for an unauthenticated Function URL that anyone can invoke. Use `--url` instead for IAM-authenticated access. Use `--arch x86_64` if the bootstrap is an x86_64 build. `--memory`, `--timeout` and `--out` are described in the guide.

If deploy succeeds, the command prints the Function URL. Test it with:

```bash
curl "https://your-url.lambda-url.us-east-1.on.aws/?name=AWS"
```

The body has this shape:

```json
{
  "message": "Hello from AWS",
  "requestId": "...",
  "path": "/"
}
```
