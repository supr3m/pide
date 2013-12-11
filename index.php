<?php
require_once('libs/php/functions.php');
session_start();
secure();

//$_SESSION['user']['name']='César Fernando';
//$_SESSION['user']['id']='cgonzalez@cobaes.edu.mx';

$fecha = Fecha();
$fecha = $fecha["numeroDiaMes"]." / ".$fecha["nombreMes"]." / ".$fecha["anio"];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>[ PIDE ] v1.0</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sistema de Control de Proyectos PIDE v1.0">
    <meta name="author" content="COBAES">

    <link href="css/bootstrap.min.css" rel="stylesheet" />
    <link href="css/custom-theme/jquery-ui-1.10.0.custom.css" rel="stylesheet" />
    <link href="css/font-awesome.min.css" rel="stylesheet" />
    <link href="css/docs.css" rel="stylesheet" />
    <link href="css/main.css" rel="stylesheet" />
    <!--[if IE 7]>
    <link rel="stylesheet" href="css/font-awesome-ie7.min.css">
    <![endif]-->
    <!--[if lt IE 9]>
    <link rel="stylesheet" type="text/css" href="css/custom-theme/jquery.ui.1.10.0.ie.css"/>
    <![endif]-->
    
    <!--[if lt IE 9]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <link rel="shortcut icon" href="img/favicon.ico" />
</head>
<body>

<div class="navbar navbar-inverse navbar-fixed-top" sytle="z-index: 1;">
    <div class="navbar-inner">
        <div class="container">
            <div class="controls filtros">
                <ul class="nav pull-left" isFilter='lineas'>
                    <li class="dropdown">
                        <a title="" class="dropdown-toggle" data-toggle="dropdown"> 
                            <b class="caret"></b>
                            <i class="icon-filter icon-white"></i> 
                            Líneas Estratégicas
                        </a>
                        <ul class="dropdown-menu pull-left filtro">
                            <li class='search'>
                                <input class="span2" type="text" placeholder="Buscar..." />
                            </li>
                        </ul>
                    </li>
                </ul>
                <ul class="nav pull-left" isFilter='acciones'>
                    <li class="dropdown ">
                        <a title="" class="dropdown-toggle" data-toggle="dropdown"> 
                            <b class="caret"></b>
                            <i class="icon-filter icon-white"></i> 
                            Acciones
                        </a>
                        <ul class="dropdown-menu pull-left filtro">
                            <li class='search'>
                                <input class="span2" type="text" placeholder="Buscar..." />
                            </li>
                        </ul>
                    </li>
                </ul>
                <ul class="nav pull-left" isFilter='programas'>
                    <li class="dropdown">
                        <a title="" class="dropdown-toggle" data-toggle="dropdown"> 
                            <b class="caret"></b>
                            <i class="icon-filter icon-white"></i> 
                            Programas
                        </a>
                        <ul class="dropdown-menu pull-left filtro">
                            <li class='search'>
                                <input class="span2" type="text" placeholder="Buscar..." />
                            </li>

                        </ul>
                    </li>
                </ul>
                <ul class="nav pull-left" isFilter='proyectos'>
                    <li class="dropdown pull-left">
                        <a title="" class="dropdown-toggle" data-toggle="dropdown"> 
                            <b class="caret"></b>
                            <i class="icon-filter icon-white"></i> 
                            Proyectos
                        </a>
                        <ul class="dropdown-menu pull-left filtro">
                            <li class='search'>
                                <input class="span2" type="text" placeholder="Buscar..." />
                            </li>

                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="jumbotron">
  <div class="container">
    <div id="logo">
        <table>
            <tr>
                <td>
                    <div class="img"><img src="img/cobaes_bn2.png"></div>
                </td>
                <td>
                    <div class="titulo">
                        <span>Plan Institucional de Desarrollo Educativo</span>
                        <span><div class="circulo01"></div><div class="circulo02"></div><div class="circulo03"></div>PLATAFORMA EJECUTIVA (PE)</span>
                    </div>
                    <div class="titulo2">
                        <div><b>POA</b><p>plantel</p></div> 
                        <i class="icon-circle-arrow-right f1"></i>
                        <div><b>POA</b><p>institucional</p></div> 
                        <i class="icon-circle-arrow-right f2"></i>
                        <div><b>PE</b></div> 
                    </div>
                </td>
            </tr>
        </table>
    </div>
  </div>
</div>


<table id="tblIndicadores" class="table table-condensed table-hover table-bordered">
    <thead>
        <tr class='tableHeader'>
            <td tipo="indicador" title='' width=578>
                <b>Indicador</b>
            </td>
            <td tipo="actividad" title=''>
                <b>Resultado de la Actividad</b>
            </td>
            <td tipo="meta" title='% Ó NÚMERO'>
                <i class='icon-question-sign'></i>
                <b>Meta de la Actividad</b>
            </td>
            <td tipo="alcance" title='% = RESULTADO DE LA ACTIVIDAD / META DE LA ACTIVIDAD'>
                <i class='icon-question-sign'></i>
                <b>Alcance de la Meta</b>
            </td>
            <td tipo="periodo" title='O FECHA CUANDO SE EVALUÓ'>
                <i class='icon-question-sign'></i>
                <b>Período</b>
            </td>
            <td width=111 tipo="ponderacion" title='ES EL PESO PONDERADO DEL ALCANCE DE LA META EN LA META GLOBAL.'>
                <i class='icon-question-sign'></i><b style="padding:0 0 0 3px;">Ponderación Global</b>
            </td>
            <td width=80 tipo="avance" title='Es el peso de avance que proporciona la actividad del indicador de gestión a la meta global (% = PESO PONDERADO DEL ALCANCE DE LA META * EL ALCANCE DE LA META)'>
                <i class='icon-question-sign'></i><b style="padding:0 0 0 3px;">Avance Global</b>
            </td>
            <td tipo="observacion" title="">
                <b>Observación</b>
            </td>
        <tr>
    </thead>
    <tbody>
    </tbody>
</table>


<table id="tblIndicadoresFloat" class="table table-condensed table-bordered"><thead></thead></table>


<div class="navbar navbar-inverse navbar-fixed-bottom" sytle="z-index: 1;">
    <div class="navbar-inner">
        <div class="container">
             
            <!-- Be sure to leave the brand out there if you want it shown 
            <a class="brand" href="#">Project name</a>-->
            <ul class="nav">
                <li><a id="btnSave" title="Guarda todos los avances actuales, se puede continuar con el proceso después" >
                    <i class="icon-save icon-white icon-large"></i> Guardar</a>
                </li>
                <li><a id="btnImp" title="Generación de los reportes">
                    <i class="icon-print icon-white icon-large"></i> Generar</a>
                </li>
            </ul>
            <ul class="nav pull-right">
                <li class="dropdown pull-right">
                    <a class="dropdown-toggle" data-toggle="dropdown"> 
                        <b><?php echo $_SESSION['user']['name']; ?></b> &nbsp;
                        <i class="icon-user icon-white icon-large"></i> <b class="caret"></b>
                    </a>
                    <ul class="dropdown-menu pull-right">
                        <li class="nav-header">Mi Cuenta</li>
                        <li class="disabled">
                            <a id="account">
                                <?php echo $_SESSION['user']['id']; ?>
                            </a>
                        </li>
                        <li class=""><a ><i class="icon-picture"></i> Cambiar imagen</a></li>
                        <li class=""><a ><i class="icon-edit-sign icon-white"></i> Cambiar contraseña</a></li>
                        <li class="divider"></li>
                        <li><a id="btnLogout"><i class="icon-off"></i> Cerrar Sesión</a></li>
                    </ul>
                </li>
            </ul>
             
            <!-- Everything you want hidden at 940px or less, place within here -->
            <div class="nav-collapse collapse">
            <!-- .nav, .navbar-search, .navbar-form, etc -->
            </div>
         
        </div>
    </div>
</div>

<br />

<hr>

<footer class="footer" style="margin-top: 0px">
    <div class="container">
       <p>Diseñado y desarrollado con todo el amor del mundo para <a href="http://www.cobaes.edu.mx" target="_blank">COBAES</a> por el dpto <a href="#?">Unidad de Informática</a></p>
       <p>Independencia No. 2142 Sur Centro Sinaloa C.P. 80129 Culiacán, Sinaloa.</p>
    </div>
</footer>

<br /><br />
<iframe id="ifLogout" name="ifLogout" style='display:none'></iframe>

<script src="libs/js/jquery-1.9.0.min.js"               type="text/javascript"></script>
<script src="libs/js/bootstrap.js"                      type="text/javascript"></script>
<script src="libs/js/jquery-ui-1.10.0.custom.min.js"    type="text/javascript"></script>
<script src="libs/js/vendor/bootstrap-datepicker.js"    type="text/javascript"></script>
<script src='libs/js/jquery.blockUI-2.61.min.js'        type="text/javascript"></script>
<script src='libs/js/waypoints/waypoints.min.js'        type="text/javascript"></script>
<script src='libs/js/waypoints/waypoints-sticky.min.js' type="text/javascript"></script>
<script src='libs/js/json.min.js'                       type="text/javascript"></script>
<script src="libs/js/functions.js"                      type="text/javascript"></script>
<script src="libs/js/mySystem.js"                       type="text/javascript"></script>

</body>
</html>