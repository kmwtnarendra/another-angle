# Usage: .\deploy.ps1
param (
    [string]$Bucket         = "anotherangle.in",
    [string]$Profile        = "anotherangle",
    [string]$DistributionId = "E3085MZ0YJI3J7"
)

$ErrorActionPreference = "Stop"

Write-Host "1/4 Building static export..." -ForegroundColor Green
npm run build

# 2. Sync static assets, JS, CSS, JSON, and .txt RSC payloads with long-lived cache
Write-Host "2/4 Syncing assets and RSC payloads to S3..." -ForegroundColor Green
aws s3 sync ./out "s3://$Bucket" `
  --profile "$Profile" `
  --delete `
  --cache-control "public, max-age=31536000, immutable" `
  --exclude "*.html"

# 3. Sync HTML files with no-cache so deploys are visible immediately
Write-Host "3/4 Syncing HTML files..." -ForegroundColor Green
aws s3 sync ./out "s3://$Bucket" `
  --profile "$Profile" `
  --delete `
  --cache-control "public, max-age=0, must-revalidate" `
  --exclude "*" `
  --include "*.html"

# 4. Invalidate CloudFront so the new HTML is served right away
if ($DistributionId -ne "") {
    Write-Host "4/4 Invalidating CloudFront cache for $DistributionId..." -ForegroundColor Yellow
    aws cloudfront create-invalidation `
      --profile "$Profile" `
      --distribution-id "$DistributionId" `
      --paths "/*"
}

Write-Host "Deployment complete! Site URL: https://$Bucket" -ForegroundColor Cyan
