<?php
/////////////////////////////////////
/////////////////////////////////////
//// [CONFIGURACIÓN DEL SISTEMA] ////
////                             ////
//// vr 0.1 beta                 ////
/////////////////////////////////////
/////////////////////////////////////

// Config para la conexión con las BDs
DEFINE('motorDB'   , 'mssql');                         // Motor de BD por defecto (mysql, mysqli, mssql, postgresql)
GLOBAL $last_motorDB;
GLOBAL $last_dbh;

// MySQL
DEFINE('myUser'    , 'cesar');                         // MySQL User
DEFINE('myPasswd'  , '123456');                        // MySQL Passwd
DEFINE('myHost'    , 'mysql.cobaes.edu.mx');           // MySQL Host (Domian, IP), 201.164.152.250, 201.165.86.69, 172.50.201.220
DEFINE('myPort'    , 3306);                            // MySQL Port
DEFINE('myDB'      , 'calendario');                    // MySQL DB's Default

// MSSQL
DEFINE('msUser'    , 'sa');                            // MSSQL User
DEFINE('msPasswd'  , 'Cobaes2011');                    // MSSQL Passwd
DEFINE('msHost'    , 'mssql.cobaes.edu.mx');           // MSSQL Host (Domian, IP), DATOS, mssql.cobaes.edu.mx, 10.1.10.20
DEFINE('msPort'    , 1433);                            // MSSQL Port
DEFINE('msDB'      , 'PIDEv1');                        // MSSQL DB's Default

// Config General
DEFINE('isDebug',      0);                             // Habilitar/Deshabilitar mensajes con debug
DEFINE('rootSite',     'panel/pide');                  // Raiz del sitio, donde se encuentra index.php principal
DEFINE('welcomeSite',  'panel/pide/index.php');        // Pantalla Principal del sistema
DEFINE('loginSite',    '/panel');                      // Pantalla para Login a la aplicacion
DEFINE('logout',       'http://www.cobaes.edu.mx');
?>
