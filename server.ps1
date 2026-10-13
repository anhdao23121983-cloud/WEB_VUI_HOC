# PowerShell Lightweight HTTP Server cho WEB VUI HOC
$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "=================================================="
    Write-Host " Server Localhost dang chay tai: http://localhost:$port/"
    Write-Host " Nhan Ctrl + C trong cua so console de dung Server"
    Write-Host "=================================================="
} catch {
    Write-Host ("Khong the khoi dong server tren port {0}: {1}" -f $port, $_)
    exit 1
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".csv"   = "text/csv; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".webp"  = "image/webp"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".mp3"   = "audio/mpeg"
    ".wav"   = "audio/wav"
    ".ogg"   = "audio/ogg"
    ".mp4"   = "video/mp4"
    ".webm"  = "video/webm"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".pptx"  = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ".ppt"   = "application/vnd.ms-powerpoint"
    ".pdf"   = "application/pdf"
    ".docx"  = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ".xlsx"  = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
        if ($localPath -eq "/") { $localPath = "/index.html" }

        # Header CORS va Cache-Control phuc vu lap trinh khong bi cache
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # API: Luu bai giang vinh vien vao he thong file web
        if ($request.HttpMethod -eq "POST" -and $localPath -eq "/api/save-lectures") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $jsonBody = $reader.ReadToEnd()
                $reader.Close()

                $dataDir = Join-Path $PSScriptRoot "data"
                if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir -Force | Out-Null }
                $jsonPath = Join-Path $dataDir "saved_lectures.json"
                [System.IO.File]::WriteAllText($jsonPath, $jsonBody, [System.Text.Encoding]::UTF8)

                # Cap nhat vao js\data\defaultLectures.js de web luon luu san vinh vien
                $jsDataDir = Join-Path $PSScriptRoot "js\data"
                if (-not (Test-Path $jsDataDir)) { New-Item -ItemType Directory -Path $jsDataDir -Force | Out-Null }
                $jsFileContent = "/** KHO BAI GIANG DIEN TU DA LUU VINH VIEN TREN WEB */`nwindow.SAVED_LECTURES = " + $jsonBody + ";`n"
                $jsPath = Join-Path $jsDataDir "defaultLectures.js"
                [System.IO.File]::WriteAllText($jsPath, $jsFileContent, [System.Text.Encoding]::UTF8)

                $resJson = '{"success":true,"message":"Da luu vinh vien bai giang vao ma nguon web!"}'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } catch {
                $errJson = '{"success":false,"error":"' + $_.Exception.Message + '"}'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            $response.Close()
            continue
        }

        # API: Lay danh sach bai giang da luu
        if ($request.HttpMethod -eq "GET" -and $localPath -eq "/api/get-lectures") {
            $jsonPath = Join-Path $PSScriptRoot "data\saved_lectures.json"
            $resJson = "[]"
            if (Test-Path $jsonPath) {
                $resJson = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
            }
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        # API: Dong bo toan dien co so du lieu vao he thong file web (users, arena, lectures, quizzes)
        if ($request.HttpMethod -eq "POST" -and $localPath -eq "/api/sync-all") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $jsonBody = $reader.ReadToEnd()
                $reader.Close()

                $dataDir = Join-Path $PSScriptRoot "data"
                if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir -Force | Out-Null }
                $jsonPath = Join-Path $dataDir "app_database.json"
                [System.IO.File]::WriteAllText($jsonPath, $jsonBody, [System.Text.Encoding]::UTF8)

                # Cap nhat vao js\data\defaultDatabase.js de web luon luu vinh vien ke ca khi deploy tinh
                $jsDataDir = Join-Path $PSScriptRoot "js\data"
                if (-not (Test-Path $jsDataDir)) { New-Item -ItemType Directory -Path $jsDataDir -Force | Out-Null }
                $jsFileContent = "/** KHO CO SO DU LIEU TOAN HE THONG DA DUOC DONG BO VINH VIEN */`nwindow.DEFAULT_APP_DATABASE = " + $jsonBody + ";`n"
                $jsPath = Join-Path $jsDataDir "defaultDatabase.js"
                [System.IO.File]::WriteAllText($jsPath, $jsFileContent, [System.Text.Encoding]::UTF8)

                $resJson = '{"success":true,"message":"Da dong bo va luu tru toan bo co so du lieu vao he thong web vinh vien!"}'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } catch {
                $errJson = '{"success":false,"error":"' + $_.Exception.Message + '"}'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            $response.Close()
            continue
        }

        # API: Lay toan bo snapshot co so du lieu he thong
        if ($request.HttpMethod -eq "GET" -and $localPath -eq "/api/get-all-data") {
            $jsonPath = Join-Path $PSScriptRoot "data\app_database.json"
            $resJson = "{}"
            if (Test-Path $jsonPath) {
                $resJson = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
            }
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        # API: Upload file binary PowerPoint/PDF truc tiep vao thu muc lectures_storage
        if ($request.HttpMethod -eq "POST" -and $localPath -eq "/api/upload-file") {
            try {
                $fileName = $request.QueryString["name"]
                if (-not $fileName) { $fileName = "lecture_" + [DateTime]::Now.Ticks + ".pptx" }
                $uploadsDir = Join-Path $PSScriptRoot "lectures_storage"
                if (-not (Test-Path $uploadsDir)) { New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null }
                $savePath = Join-Path $uploadsDir $fileName

                $fileStream = [System.IO.File]::Create($savePath)
                $request.InputStream.CopyTo($fileStream)
                $fileStream.Close()

                $fileRelUrl = "lectures_storage/" + [System.Uri]::EscapeDataString($fileName)
                $resJson = '{"success":true,"fileUrl":"' + $fileRelUrl + '","fileName":"' + $fileName + '"}'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } catch {
                $errJson = '{"success":false,"error":"' + $_.Exception.Message + '"}'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $response.StatusCode = 500
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            $response.Close()
            continue
        }

        $filePath = Join-Path $PSScriptRoot $localPath.TrimStart('/')
        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            if ($mimeTypes.ContainsKey($ext)) {
                $response.ContentType = $mimeTypes[$ext]
            } else {
                $response.ContentType = "application/octet-stream"
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundMsg = "404 - Khong tim thay file: $localPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFoundMsg)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host ("Server ngung hoat dong: {0}" -f $_)
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
