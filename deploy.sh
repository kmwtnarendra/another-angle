#!/usr/bin/env bash
# Build and sync to an S3 bucket configured for static website hosting.
#
# Usage:
#   ./deploy.sh your-bucket-name [aws-profile]
#
# Prereqs (one-time, see README.md):
#   - AWS CLI installed and configured (aws configure)
#   - S3 bucket created with static website hosting enabled
set -euo pipefail

BUCKET="${1:?Usage: ./deploy.sh <bucket-name> [aws-profile]}"
PROFILE="${2:-default}"

echo "Building static export..."
npm run build

echo "Syncing ./out to s3://$BUCKET ..."
aws s3 sync ./out "s3://$BUCKET" \
  --profile "$PROFILE" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.txt"

# HTML should revalidate on every request so deploys show up immediately
aws s3 sync ./out "s3://$BUCKET" \
  --profile "$PROFILE" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html"

echo "Done. Site URL: http://$BUCKET.s3-website-<your-region>.amazonaws.com"
