<?php
require_once('vendor/tecnickcom/tcpdf/tcpdf.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['jsonData'])) {
    $data = json_decode($_POST['jsonData'], true);
    $userName = htmlspecialchars($data['userName'] ?: 'Mein Trainingsplan');

    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetAutoPageBreak(TRUE, 15);
    $pdf->AddPage();

    // --- ШАПКА ---
    // Логотип: поднимаем выше (y = 5 вместо 15), чтобы он не пересекал линию
    $logoPath = 'img/thumbnail.jpg'; 
    if (file_exists($logoPath)) {
        // Параметры: файл, x, y, width
        $pdf->Image($logoPath, 160, 5, 30); 
    }
    
    $pdf->SetY(15); // Текст заголовка чуть ниже логотипа
    $pdf->SetFont('helvetica', 'B', 18);
    $pdf->Cell(0, 10, $userName, 0, 1, 'L');
    
    $pdf->Ln(2);
    $pdf->Line(15, 30, 195, 30); // Линия под заголовком (чуть опустили y до 30)
    $pdf->Ln(10);

    foreach ($data['blocks'] as $block) {
        $startY = $pdf->GetY();
        
        if ($startY > 230) { 
            $pdf->AddPage(); 
            $startY = $pdf->GetY(); 
        }

        // --- 1. ИЗОБРАЖЕНИЕ ---
        if (!empty($block['imgData']) && strpos($block['imgData'], 'data:image') === 0) {
            // Очищаем строку base64 от префикса для корректной работы TCPDF
            $img = $block['imgData'];
            if (preg_match('/^data:image\/(\w+);base64,/', $img, $type)) {
                $img = substr($img, strpos($img, ',') + 1);
                $img = base64_decode($img);
                // Используем префикс '@' для передачи данных из переменной, а не из файла
                $pdf->Image('@'.$img, 15, $startY, 45, 45);
            }
        } else {
            $pdf->SetDrawColor(200, 200, 200);
            $pdf->Rect(15, $startY, 45, 45); // Серый квадрат, если нет фото
        }

        // --- 2. ДАННЫЕ ---
        $pdf->SetDrawColor(0, 0, 0); // Возвращаем черный цвет для линий
        $pdf->SetXY(65, $startY);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(35, 8, 'Übungsname:', 0, 0);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $block['name'], 0, 1);

        $pdf->SetX(65);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(35, 8, 'Gewicht:', 0, 0);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $block['weight'], 0, 1);

        $pdf->SetX(65);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(35, 8, 'Dauer:', 0, 0);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(0, 8, $block['duration'], 0, 1);

        // --- 3. ЗАМЕТКИ (БЕЗ РАМКИ) ---
        $pdf->SetXY(130, $startY);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, 'Notizen:', 0, 1);
        $pdf->SetXY(130, $startY + 8);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(65, 34, $block['notes'], 0, 'L');

        // Смещаемся вниз для разделительной линии
        $pdf->SetY($startY + 50);
        $pdf->SetDrawColor(230, 230, 230); // Светло-серая линия-разделитель
        $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
        $pdf->Ln(8);
    }

    $pdf->Output(str_replace(' ', '_', $userName) . '.pdf', 'I');
}
