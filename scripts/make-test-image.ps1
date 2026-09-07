Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::new(1280, 720)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'

# paper background (no brush needed)
$g.Clear([System.Drawing.Color]::FromArgb(247, 244, 236))

# grid lines
$line = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(221, 214, 200), 2)
for ($x = 0; $x -lt 1280; $x += 40) { $g.DrawLine($line, $x, 0, $x, 720) }
for ($y = 0; $y -lt 720; $y += 40) { $g.DrawLine($line, 0, $y, 1280, $y) }

# warm accent disc (thick inset pen acts as fill)
$accentPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(218, 119, 86), 420)
$accentPen.Alignment = [System.Drawing.Drawing2D.PenAlignment]::Inset
$g.DrawEllipse($accentPen, 460, 200, 360, 360)

# ink ring outline
$inkPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(38, 36, 31), 4)
$g.DrawEllipse($inkPen, 620, 360, 200, 200)

$g.Dispose()
$bmp.Save('F:\hugo_gcnanmu\content\posts\with-images\paper-test.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host 'image created ok'
