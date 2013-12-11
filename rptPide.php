<?php
error_reporting(E_ALL);
ini_set('display_errors', 'on');
define('FPDF_FONTPATH','font/fpdf/');

require_once('libs/php/extendsFPDF.php');
require_once("libs/php/phplot.php");
require_once('libs/php/functions.php');


// PARAMETROS
$tipoRPT = (isset($_REQUEST['data']) ? $_REQUEST['data'] : null);
$account = (isset($_REQUEST['account']) ? $_REQUEST['account'] : "todomundo");
$account = split("@", $account);
$account = $account[0];
$patchGrafica1 = "files/".$account."_grafica1_time_.png";
$patchGrafica2 = "files/".$account."_grafica2_time_.png";
$resp['descErr'] = 0;
$patchPDF = "files/rptPide.pdf";

$dbh = conx();
switch($tipoRPT) {
    case "all":
        $pdf = new PDF('l', 'mm', 'letter');
        //$pdf->grid = false;
        //$pdf->grid = 10;
        $pdf->AliasNbPages();
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(true, 5);
        $pdf->SetFont('Times','',12);

        // LINEAS
        $Query = "SELECT LineaID, Indice, Descripcion FROM Lineas ORDER BY LineaID ASC";
        $rQuery = execQ($Query);
        $rQuery = $rQuery['result'];

        while ($rowLinea = mssql_fetch_assoc($rQuery)){
            $lineaID = $rowLinea["LineaID"];
            $descLinea = utf8_encode($rowLinea["Descripcion"]);
            $indiceLinea = utf8_encode(trim($rowLinea["Indice"]));

            // ACCIONES
            $Query = "SELECT AccionID, Indice, Linea, Descripcion FROM Acciones WHERE Linea='$indiceLinea' ORDER BY AccionID ASC";
            $rQuery2 = execQ($Query);
            $rQuery2 = $rQuery2['result'];
            
            while ($rowAccion = mssql_fetch_assoc($rQuery2)){
                $accionID = $rowAccion["AccionID"];
                $descAccion = utf8_encode($rowAccion["Descripcion"]);
                $indiceAccion = utf8_encode(trim($rowAccion["Indice"]));

                // METAS
                $Query = "SELECT MetaID, Indice, Accion, Descripcion FROM Metas WHERE Accion='$indiceAccion' ORDER BY MetaID ASC";
                $rQuery3 = execQ($Query);
                $rQuery3 = $rQuery3['result'];
                while ($rowAccion = mssql_fetch_assoc($rQuery3)){
                    $descMeta = utf8_encode($rowAccion['Descripcion']);
                    $indiceMeta = utf8_encode(trim($rowAccion['Indice']));

                    //ENCABEZADO
                    $pdf->SetFillColor(235,240,222);
                    $pdf->SetDrawColor(200,200,200);
                    $pdf->SetTextColor(30,30,30);
                    $pdf->AddPage();
                    $pdf->SetWidths(array(280));
                    $pdf->Row(
                        array("<b>Línea Estratégica ".$indiceLinea.";</b>".$descLinea."<br><b>Acción ".$indiceAccion."</b>".$descAccion),
                        array(2,10,2,10),
                        'writehtml'
                    );
                    $pdf->Ln(1);
                    $pdf->SetFillColor(146,205,221);
                    $pdf->Row(
                        array("<b>PROYECTOS                                                                     RESULTADOS DE LOS INDICADORES DE GESTIÓN A SEPTIEMBRE DEL 2013</b>"),
                        array(2,10,2,10),
                        'writehtml'
                    );
                    $pdf->Ln(1);

                    // PROYECTOS
                    $Query = "
    SELECT ln.Indice AS Linea, ac.Indice AS Accion, mt.Indice AS Meta, mt.Descripcion AS descMeta, pg.Indice AS Programa, py.Indice AS Proyecto, py.Descripcion AS descProyecto
    FROM Proyectos py INNER JOIN (Programas pg INNER JOIN (Metas mt INNER JOIN (Acciones ac INNER JOIN Lineas ln ON LTRIM(RTRIM(ac.Linea)) = LTRIM(RTRIM(ln.Indice))) 
                                                                                        ON LTRIM(RTRIM(mt.Accion)) = LTRIM(RTRIM(ac.Indice))) 
                                                                ON LTRIM(RTRIM(pg.Metas)) = LTRIM(RTRIM(mt.Indice)))
                                            ON LTRIM(RTRIM(py.Programa)) = LTRIM(RTRIM(pg.Indice))
    WHERE LTRIM(RTRIM(mt.Indice))='$indiceMeta'";
                    //echo "<br /><br /><b>Query 01:</b><br />$Query<br /><br />";
                    $rQuery4 = execQ($Query);
                    $rQuery4 = $rQuery4['result'];

                    //Graficas únicas por META
                    $newPatchGrafica1 = str_replace("_time_", "_".$indiceMeta, $patchGrafica1);
                    $newPatchGrafica2 = str_replace("_time_", "_".$indiceMeta, $patchGrafica2);

                    $dataGrafica01 = array();
                    $dataGrafica02 = array();
                    $avanceTotal = 0;
                    $yIndicador = 0;
                    while ($rowAccion = mssql_fetch_assoc($rQuery4)){
                        $descProyecto = utf8_encode($rowAccion['descProyecto']);
                        $indiceProyecto = utf8_encode($rowAccion['Proyecto']);

                        $xProyecto=$pdf->GetX();
                        $yProyecto=$pdf->GetY();
                        //if ($yIndicador=$yProyecto)
                        $pdf->SetFont('Times','B',11);
                        $pdf->MultiCell(60,5,"$descProyecto",0,'R');
                        //$x1=$pdf->GetX();
                        $y1=$pdf->GetY();
                        //$pdf->Line($x, $y, 850, $y);
                        
                        //INDICADORES
                        $Query = "
    SELECT Ind.Indice, Ind.Proyecto, Ind.Descripcion, rp.Calif, Ind.Meta, rp.Alcance, Ind.Ponderacion, rp.Avance, rp.Observacion
    FROM Indicadores Ind INNER JOIN RespuestasPide rp ON Ind.Indice = REPLACE(RTRIM(LTRIM(rp.indicadorID)),'_','.')
    WHERE Ind.Proyecto='$indiceProyecto' AND rp.cuenta='todomundo@cobaes.edu.mx'
    ORDER BY Ind.IndicadorID ASC";
                        //echo "<b>Query 02:</b><br />$Query<br />";
                        $rQuery5 = execQ($Query);
                        $rQuery5 = $rQuery5['result'];

                        $firtTime = 1;
                        $ponderacion = 0;
                        $avance = 0;

                        while ($rowAccion = mssql_fetch_assoc($rQuery5)){
                            $descIndicador = utf8_encode($rowAccion['Descripcion']);
                            $indiceIndicador = utf8_encode($rowAccion['Indice']);
                            $alcanceIndicador = $rowAccion['Alcance'];
                            $alcanceIndicador = (is_numeric($alcanceIndicador) ? $alcanceIndicador . " %" : "..." );

                            $ponderacion += floatval($rowAccion['Ponderacion']);
                            $avance += floatval($rowAccion['Avance']);

                            if ($firtTime){
                                $firtTime--;
                                $pdf->SetY($yProyecto);
                            }
                            $pdf->SetDrawColor(150,150,150);
                            $pdf->SetX(60);
                            $pdf->SetFont('Times','',11);
                            
                            $yIndicador=$pdf->GetY();
                            $pdf->MultiCell(200,5,"$descIndicador",0,'L');
                            $pdf->Line(60, $pdf->GetY(), 270, $pdf->GetY());
                            $pdf->SetY($pdf->GetY()-5);

                            $pdf->Cell(270,5,$alcanceIndicador,0,1,'R');
                            //$pdf->SetX(180);
                            //$pdf->SetY($yIndicador);
                            //$pdf->MultiCell(40,5,"80 %",0,'L');

                        }
                        //$ponderacion = ($ponderacion==0 ? 1 : $ponderacion);
                        $avanceTotal += floatval($avance);
                        $avance = round(($avance*1)/($ponderacion==0 ? 1 : $ponderacion), 2);
                        $descProyecto = utf8_decode($descProyecto);

                        // DATA -> Gráfica 01
                        $ponderacion = array(substr($descProyecto, 0, 78), $ponderacion);
                        array_push($dataGrafica01, $ponderacion);

                        // DATA -> Gráfica 02
                        $avance = array(substr($descProyecto, 0, 20)."\n".substr($descProyecto, 20, 20)."\n".substr($descProyecto, 40, 20), $avance);
                        array_push($dataGrafica02, $avance);

                        //$x2=$pdf->GetX();
                        $pdf->SetDrawColor(70,70,70);
                        if ($pdf->GetY()==$y1){
                            $y2 = $y1 + 5;
                        } else {
                            $y2=max($pdf->GetY(), $y1);
                        }
                        $pdf->Line($pdf->GetX(), $y2, 850, $y2);
                    }

                    //GRAFICAS
                    $pdf->SetFillColor(235,240,222);
                    $pdf->SetDrawColor(200,200,200);
                    $pdf->SetTextColor(30,30,30);
                    $pdf->AddPage();
                    $pdf->SetWidths(array(280));
                    $pdf->Row(
                        array("<b>Línea Estratégica ".$indiceLinea.";</b>".$descLinea."<br><b>Acción ".$indiceAccion."</b>".$descAccion),
                        array(2,10,2,10),
                        'writehtml'
                    );

                    //Titulos de las Graficas
                    $pdf->Ln(1);
                    $pdf->SetFillColor(146,205,221);
                    $pdf->Row(
                        array("<b>Meta ".$indiceMeta.";</b> ".$descMeta),
                        array(2,10,2,10),
                        'writehtml'
                    );
                    $pdf->Ln(1);

                    //Sobrear todo el area de las graficas
                    $x=$pdf->GetX();
                    $y=$pdf->GetY();
                    $pdf->SetFillColor(241,241,241);
                    $pdf->SetDrawColor(241,241,241);
                    $pdf->Rect(0,$y,280,180,'F');
                    $pdf->Ln(5);

                    $pdf->Row(
                        array("<b>                         P O N D E R A C I Ó N   D E   L O S   P R O Y E C T O S                                                        A V A N C E   P O R   P R O Y E C T O</b>"),
                        array(0,0,0,0),
                        'writehtml'
                    );
                    $y=$pdf->GetY();
                    $pdf->SetY($y-3);

                    ////////////////////////////////////
                    /////     GRAAAAFIIICAAAAA     /////
                    ////////////////////////////////////

                    //Specify some data
                    $data = array(
                      array('Australia', 7849),
                      array('Dem Rep Congo', 299),
                    );
                    /*
                    echo "<pre>";
                    print_r($dataGrafica01);
                    echo "</pre>";
                    */
                    graf01($dataGrafica01, $newPatchGrafica1);
                    $pdf->Ln(5);
                    $pdf->SetX(5);
                    $x=$pdf->GetX();
                    $y=$pdf->GetY();
                    $pdf->Image($newPatchGrafica1);

                    $data = array(
                      array('San Francisco CA', 20.11),
                      array('Reno NV', 7.5),
                    );
                    graf02($dataGrafica02, $newPatchGrafica2);

                    $pdf->SetY($y);
                    $pdf->SetX(140);
                    $pdf->Image($newPatchGrafica2);

                    //Observaciones y Calificación TOTAL
                    $pdf->Ln(5);
                    $pdf->SetFont('Times','B',11);
                    $pdf->Row(
                        array("                                                                O B S E R V A C I O N E S                                                                             A V A N C E   F I N A L   D E   L A   M E T A"),
                        array(0,0,0,0),
                        'write'
                    );
                    $y=$pdf->GetY();
                    $pdf->SetFillColor(255,255,255);
                    $pdf->SetDrawColor(186,186,186);
                    $pdf->Ln(5);
                    $pdf->Rect(5,$y,158,25,'FD');
                    $pdf->Rect(165,$y,109,25,'FD');

                    $pdf->SetFillColor(242,242,0);
                    $pdf->SetTextColor(30,30,30);
                    // Condición de Colores
                    if ($avanceTotal<=70){
                        $pdf->SetTextColor(250,250,250);
                        $pdf->SetFillColor(243,35,5);    // ROJO
                    } elseif ($avanceTotal <= 89) {
                        $pdf->SetFillColor(242,242,0);   // AMARILLO
                    } elseif ($avanceTotal >= 90) {
                        $pdf->SetFillColor(153,215,51);  // VERDE
                    }

                    $pdf->SetDrawColor(220,220,220);
                    $pdf->Rect(183,$y+5,75,15,'F');

                    $pdf->SetY($y+3);
                    $pdf->SetX(7);
                    $pdf->SetFont('Times','',11);

                    if ($avanceTotal<=70){
                        $pdf->SetTextColor(30,30,30);
                        $pdf->MultiCell(155,5,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et facilisis nisi. Sed aliquet, diam eget cursus auctor, risus lorem egestas nulla, non congue libero orci eu quam. Sed nec luctus dui, et volutpat justo. Curabitur imperdiet erat id libero vulputate cursus. Nam elementum nulla purus, quis bibendum leo adipiscing aliquet.",0,'L');
                        $pdf->SetTextColor(250,250,250);
                    } else{
                        $pdf->MultiCell(155,5,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et facilisis nisi. Sed aliquet, diam eget cursus auctor, risus lorem egestas nulla, non congue libero orci eu quam. Sed nec luctus dui, et volutpat justo. Curabitur imperdiet erat id libero vulputate cursus. Nam elementum nulla purus, quis bibendum leo adipiscing aliquet.",0,'L');
                    }
                        

                    $pdf->SetY($y+10);
                    $pdf->SetFont('Times','B',30);
                    $pdf->MultiCell(444,5,$avanceTotal." %",0,'C');
                    $pdf->SetFont('Times','',11);
                    $pdf->SetTextColor(30,30,30);

                }
            }
        }
        
        //Genarmos el archivo fisico .PDF
        if (file_exists($patchPDF)) {
            @unlink($patchPDF);
        }
        $pdf->Output($patchPDF, "F");
        
        // Imprimimos resultados
        $resp["patchPDF"]=$patchPDF;
        if (!$resp['descErr']) $resp['anyErr']=0; else $resp['anyErr']=1;
        echo json_encode($resp);

        break;
    default:
        $resp['descErr']='Error desconocido';
        break;
}

function graf01($data=0, $patch=0) {
    // Eliminamos la grafica si existe//
    // Poner nombre a la grafica "cgonzalez_grafica.png"
    if (file_exists($patch)) {
        @unlink($patch);
    }
    if (!file_exists($patch)) {
        $graph = new PHPlot(505,350);
        $graph->SetImageBorderType('plain');

        $graph->SetPlotType('pie');
        $graph->SetDataType('text-data-single');
        $graph->SetDataValues($data);

        # Set enough different colors;
        # 99D715(153,215,21)    6E863B(110,134,59)    466603(70,102,3)    C9F56B(201,245,107)    DEF5AD(222,245,173)
        # E69917(230,153,23)    8F723F(143,114,63)    6D4603(109,70,3)    F9C56D(249,197,109)    F9DEB0(249,222,176)
        # 203C9B(32,60,155)     313C61(49,60,97)      04144A(4,20,74)     748EE6(116,142,230)    ABB8E6(171,184,230)
        /*$graph->SetDataColors(
            array(
                array(153,215,21), 
                array(110,134,59),
                array(70,102,3),
                array(201,245,107),
                array(222,245,173),

                array(230,153,23),
                array(143,114,63),
                array(109,70,3),
                array(249,197,109),
                array(249,222,176),

                array(32,60,155),
                array(49,60,97),
                array(4,20,74),
                array(116,142,230),
                array(171,184,230)
            )
        );*/

        # Main plot title:
        //$graph->SetTitleFontSize('3');
        //$graph->SetTitle("World Gold Production, 1990\n(1000s of Troy Ounces)");

        //Otros
        $graph->SetMarginsPixels(null,null,40,null);
        $graph->SetPlotAreaWorld(2000,0,2035,2000);
        $graph->SetPlotBgColor('white');
        $graph->SetBackgroundColor('white');

        # Build a legend from our data array.
        # Each call to SetLegend makes one line as "label: value".
        $graph->SetXDataLabelPos('plotin');
        foreach ($data as $row)
          $graph->SetLegend($row[0]);
        # Place the legend in the upper left corner:
        $graph->SetLegendPixels(5, 5);

        # No 3-D shading of the bars:
        $graph->SetShading(14);

        //Para generar imagen PNG
        $graph->SetPrintImage(false);
        $graph->SetFileFormat("png");
        $graph->SetOutputFile($patch);
        $graph->SetIsInline(true);
        $graph->DrawGraph();
        $graph->PrintImage();
    }
}

function graf02($data=0, $patch=0) {
    // Eliminamos la grafica si existe//
    // Poner nombre a la grafica "cgonzalez_grafica.png"
    if (file_exists($patch)) {
        @unlink($patch);
    }

    $graph = new PHPlot(505,350);
    $graph->SetImageBorderType('plain'); // Improves presentation in the manual

    //$graph->SetTitleFontSize('3');
    //$graph->SetTitle("Average Annual Precipitation (inches)\n"
    //              . "Selected U.S. Cities");
    $graph->SetBackgroundColor('white');
    $graph->SetPlotBgColor('white');

    #  Force the X axis range to start at 0:
    $graph->SetPlotAreaWorld(0);
    #  No ticks along Y axis, just bar labels:
    $graph->SetYTickPos('none');
    #  No ticks along X axis:
    $graph->SetXTickPos('none');
    #  No X axis labels. The data values labels are sufficient.
    $graph->SetXTickLabelPos('none');
    #  Turn on the data value labels:
    $graph->SetXDataLabelPos('plotin');
    #  No grid lines are needed:
    $graph->SetDrawXGrid(FALSE);

    # Set enough different colors;
    # 99D715(153,215,21)    6E863B(110,134,59)    466603(70,102,3)    C9F56B(201,245,107)    DEF5AD(222,245,173)
    # E69917(230,153,23)    8F723F(143,114,63)    6D4603(109,70,3)    F9C56D(249,197,109)    F9DEB0(249,222,176)
    # 203C9B(32,60,155)     313C61(49,60,97)      04144A(4,20,74)     748EE6(116,142,230)    ABB8E6(171,184,230)
    $graph->SetDataColors(
        array(
            /*"#99D715", 
            "#6E863B",
            "#466603",
            "#C9F56B",
            "#DEF5AD",
            
            "#E69917",
            "#8F723F",
            "#6D4603",
            "#F9C56D",
            "#F9DEB0",*/

            "#203C9B",
            "#313C61",
            "#04144A",
            "#748EE6",
            "#ABB8E6"
        )
    );
    //$graph->SetDataColors(NULL, NULL, 60);
    
    
    #  Use less 3D shading on the bars:
    $graph->SetShading(4);
    $graph->SetDataValues($data);
    $graph->SetDataType('text-data-yx');
    $graph->SetPlotType('bars');


    //Para generar imagen PNG
    $graph->SetPrintImage(false);
    $graph->SetFileFormat("png");
    $graph->SetOutputFile($patch);
    $graph->SetIsInline(true);
    $graph->DrawGraph();
    $graph->PrintImage();
}

?>