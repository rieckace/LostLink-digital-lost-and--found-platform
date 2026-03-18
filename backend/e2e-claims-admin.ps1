param(
  [string]$Base = 'auto',
  [string]$AdminEmail = 'admin@lostlink.local',
  [string]$AdminPassword = 'admin@123'
)

$ErrorActionPreference = 'Stop'

function New-Email([string]$prefix) {
  return ("{0}{1}@example.com" -f $prefix, (Get-Random -Maximum 1000000))
}

function Post-Json($uri, $body, $headers = @{}) {
  return Invoke-RestMethod -Method Post -Uri $uri -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 10) -Headers $headers
}

function Patch-Json($uri, $body, $headers = @{}) {
  return Invoke-RestMethod -Method Patch -Uri $uri -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 10) -Headers $headers
}

if ($Base -eq 'auto') {
  $resolved = $null
  foreach ($p in 4003..4025) {
    try {
      $health = Invoke-RestMethod -Method Get -Uri "http://localhost:$p/api/health" -TimeoutSec 2
      if ($health -and $health.status -eq 'ok') {
        $resolved = "http://localhost:$p/api"
        break
      }
    } catch {
      # ignore
    }
  }

  if (-not $resolved) {
    throw 'Could not auto-detect API base. Provide -Base http://localhost:PORT/api'
  }

  $Base = $resolved
}

Write-Host "BASE=$Base"

# 1) Register two users
$userEmail = New-Email 'user'
$reporterEmail = New-Email 'reporter'

$user = Post-Json "$Base/auth/register" @{ name = 'User'; email = $userEmail; password = 'password123' }
$reporter = Post-Json "$Base/auth/register" @{ name = 'Reporter'; email = $reporterEmail; password = 'password123' }

$userToken = $user.token
$reporterToken = $reporter.token

Write-Host "USER=$userEmail"
Write-Host "REPORTER=$reporterEmail"

# 2) Create an item as reporter
$itemPayload = @{
  type = 'lost'
  title = 'Black Wallet'
  category = 'Accessories'
  location = 'Central Library'
  locationLabel = 'Central Library'
  dateISO = (Get-Date -Format 'yyyy-MM-dd')
  description = 'Black wallet near library'
  tags = @('wallet', 'black', 'library')
  lat = 13.0827
  lng = 80.2707
  imageUrl = 'https://example.com/img.jpg'
}

$itemResp = Post-Json "$Base/items" $itemPayload @{ Authorization = "Bearer $reporterToken" }
$itemId = $itemResp.item.id
Write-Host "ITEM_ID=$itemId"

# 3) Submit a claim as user
$claimPayload = @{ itemId = $itemId; proofText = 'I lost my black wallet at Central Library yesterday. It has my cards.' }
$claimResp = Post-Json "$Base/claims" $claimPayload @{ Authorization = "Bearer $userToken" }
$claimId = $claimResp.claim.id
Write-Host "CLAIM_ID=$claimId"
Write-Host "CLAIM_AI_SCORE=$($claimResp.claim.aiScore)"

# 4) Admin login
$admin = Post-Json "$Base/auth/login" @{ email = $AdminEmail; password = $AdminPassword }
$adminToken = $admin.token
Write-Host "ADMIN_ROLE=$($admin.user.role)"

# 5) List pending claims and find ours
$claimsList = Invoke-RestMethod -Method Get -Uri "$Base/admin/claims?status=PENDING" -Headers @{ Authorization = "Bearer $adminToken" }
$found = $claimsList.claims | Where-Object { $_.id -eq $claimId } | Select-Object -First 1

if (-not $found) {
  throw "Claim not found in admin list. Total claims returned: $($claimsList.claims.Count)"
}

Write-Host "ADMIN_LIST_AI_SCORE=$($found.aiScore)"

# 6) Try approval (should fail if score < 75)
try {
  $approve = Patch-Json "$Base/admin/claims/$claimId/status" @{ status = 'APPROVED' } @{ Authorization = "Bearer $adminToken" }
  Write-Host "APPROVE_OK=$($approve.message)"
} catch {
  $details = $_.ErrorDetails.Message
  if (-not $details) { $details = $_.Exception.Message }
  Write-Host "APPROVE_ERR=$details"
}
