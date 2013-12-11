<?php
require_once('config.php');

/*
 * Realiza una conexi?n a una base de datos desde un motor indicado.
 * @parametros
 *    motorDB: usa el tipo de motor indicado, si no se encuentra, usa el valor por defecto (config.php)
 *    dbName: se conecta a la base de datos indicada en particular, si no, usa el valor por defecto (config.php)
 * @return
 *     regresa el manejador de la base de datos.
 */ 
function conx($motorDB=0, $dbName=0) {
   GLOBAL $last_motorDB;
   GLOBAL $last_dbh;
   //echo $motorDB.' | '.$dbName.'<br />';
   
   //$dbName = (isset($dbName) && $dbName ? $dbName : $last_motorDB);
   $motorDB = (isset($motorDB) && $motorDB ? $motorDB : motorDB);
   $last_motorDB = $motorDB;
   
   //echo (!$dbName ? myDB : $dbName).' | '.$motorDB.' | '.$last_motorDB.' | '.myDB;
   //die();
   
   switch (TRIM($motorDB)) {
      case 'mysql':
         $dbh = mysql_connect(myHost, myUser, myPasswd);
         
         if (!$dbh) return false;
         if (!(mysql_select_db((!$dbName ? myDB : $dbName), $dbh)))  return false; 
         //mysql_set_charset('utf8');
         break;
      case 'mysqli':     
         $dbh = mysqli_connect(myHost, myUser, myPasswd, (!$dbName ? myDB : $dbName), myPort);
         if (!$dbh) return false; 
         //mysqli_set_charset($dbh, "utf8");
         break;
      case 'pgsql':
         $dbh = "host=".pgHost." port=".pgPort." dbname=".(!$dbName ? pgDB : $dbName). " user=".pgUser." password=".pgPasswd;
         $dbh = pg_pconnect($dbh);
         
         if (!$dbh) return false; 
         return false;
         break;
      case 'mssql':
         $dbh = mssql_connect(msHost.','.msPort, msUser, msPasswd);
         
         if (!$dbh) {
            return false;
         }
         if (!(mssql_select_db((!$dbName ? msDB : $dbName), $dbh)))  return false; 
         break;
      default:
         return false;
         break;
   }
   $last_dbh = $dbh;
   return $dbh;
}

/*
 * Ejecuta una instrucci?n SQL.
 * @parametros
 *    Query: Cadena de instrucciones SQL
 *    dbh: usa el $link_identifier indicado para ejecutar la consulta, si no se encuentra, usa el m?s reciente utilizado.
 *    motorDB: usa el tipo de motor indicado, si no se encuentra, usa el m?s reciente utilizado.
 * @return
 *     regresa el manejador de la base de datos.
 * @ej
 *    exe('SELECT foo FROM myFoo') 
 *    exe('SELECT foo FROM myFoo', $link_identifier)
 *    exe('SELECT foo FROM myFoo', $link_identifier, 'mysqli')
 */
function execQ($Query, $dbh=0, $motorDB=0) {
   GLOBAL $last_dbh;
   GLOBAL $last_motorDB;
   $dbh = (isset($dbh) && $dbh ? $dbh : $last_dbh);
   $motorDB = (isset($motorDB) && $motorDB ? $motorDB : $last_motorDB);
   
   switch (TRIM($motorDB)) {
      case 'mysql':
         $rQuery = mysql_query($dbh, $Query);
         //$result['fetch_assoc'] = @mysql_fetch_assoc($rQuery);
         $result['affected_rows'] = mysql_affected_rows($dbh);
         break;
      case 'mysqli':
         $rQuery = mysqli_query($dbh, $Query);
         $result['result'] = $rQuery;
         //$result['fetch_assoc'] = @mysqli_fetch_assoc($rQuery);
         $result['affected_rows'] = mysqli_affected_rows($dbh);
         break;
      case 'mysqli2':
         $rQuery = mysqli_multi_query($dbh, $Query);
         do {
            /* store first result set */
            if ($rQuery = mysqli_store_result($dbh)) {
               if (mysqli_affected_rows($dbh)==0){
                  return false;
               }
               mysqli_free_result($rQuery);
            }
         } while (mysqli_next_result($dbh) && mysqli_more_results($dbh));

         $result['result'] = $rQuery;
         //$result['fetch_assoc'] = @mysqli_fetch_assoc($rQuery);
         $result['affected_rows'] = mysqli_affected_rows($dbh);
         break;
      case 'pgsql':
         break;
      case 'mssql':
         $rQuery = mssql_query($Query, $dbh);
         $result['result'] = $rQuery;
         //$result['fetch_assoc'] = mssql_fetch_assoc($rQuery);
         //$result['affected_rows'] = mssql_num_rows($dbh);
         break;
      default:
         return false;
         break;
   }
   
   return $result;
}

function secure() {
   //ob_start();
   // REDIRECCIONAR AL SITIO COBAES.INFO (SIN WWW)
   if ($_SERVER['HTTP_HOST'] == "www.cobaes.info"){
      //die("http://cobaes.info".$_SERVER['REQUEST_URI']);
      header('Location: http://cobaes.info'.$_SERVER['REQUEST_URI']);
      die();
   }
   //require_once('libs/sessions.php');
   if (@$_SESSION["verified"] == 0 || @$_SESSION["pide"] == 0 || @$_SESSION["panel"] == 1) {
      $_SESSION['prevURL'] = rootSite;
      $_SESSION["pide"] = 0;
      header('Location: '.loginSite);
      die();
   } else {
      $_SESSION["pide"] = 1;
      $_SESSION['prevURL'] = rootSite.$_SERVER['PHP_SELF'];
   }
   //ob_end_flush();
}

/*
 * Muestra las instrucciones indicadas al usuario (debug) y los guarda en un archivo 'error.log'
 */
function runDebug($str, $Query) {
   if (isDebug) {
      $file = fopen('error.log','a'); 
      fwrite($file,"[".date("r")."] [DEBUG] $str\r\n");
      if (!empty($Query)) fwrite($file,"[".date("r")."] [Query] \r\n$Query\r\n");
      fclose($file);
      set_error_handler('error'); 
   }
}

//Cifra un str con su hash
function createPasswd($hash, $str) {
   switch($hash) {
      case 'md5':
         return 'md5'.md5($str);
         break;
      case 'sha1':
         return 'sha1'.sha1($str);
         break;
      default:
         return 0;
         break;
   }
}

/*
 * Funci?n para validar/detectar el nivel de seguridad de una contrase?a
 * @alcance              Privado
 * @return               Integer [0=No Permitido, 1=Bajo, 2=Medio, 3=Alto, 4=Muy Seguro]
 * @fuente               C?sar Fdo...
 */
function validPasswd($strPasswd) {
   $numIN = 0;
   $letMayIN = 0;
   $letMinIN = 0;
   $allowIN = 0;
   
   //[DEFINIMOS EL PASSWORD EN ASCII]
   //Recojemos el password, hacemos TRIM y lo convertimos a ASCII.
   $passwd = trim($strPasswd);
   $ASCII = str_split($passwd);
   foreach ($ASCII as $key => $item)
      $ASCII[$key] = ord($item);
   
   /*[DEFINIMOS LOS PARAMETROS DE EVALUACI?N]
    * justNum=Numeros, justLetMay=Letras Mayusculas, justLetMin=Letras Minusculas, justAllowed=Otros
    */
   $justNum    = array(48,49,50,51,52,53,54,55,56,57);
   $justLetMay = array(65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90);
   $justLetMin = array(97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122);
   $justAllowed= array(33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,
                       58,59,60,61,62,63,64,
                       91,92,93,94,95,
                       123,124,125,126
                     );
   // Todos los caracteres permitidos.
   $allAllowed = array_merge($justNum, $justLetMay, $justLetMin, $justAllowed);

   /* [EVALUAMOS]
    * Caracteres NO permitidos.
    */
   foreach ($ASCII as $key => $item)
      if (!in_array($item, $allAllowed))
         return 0;
   
   // Caracteres encontrados
   foreach ($ASCII as $key => $item) {
      if (!$numIN)    { if (in_array($item, $justNum))     { $numIN    = 1; continue; } }
      if (!$letMayIN) { if (in_array($item, $justLetMay))  { $letMayIN = 1; continue; } }
      if (!$letMinIN) { if (in_array($item, $justLetMin))  { $letMinIN = 1; continue; } }
      if (!$allowIN)  { if (in_array($item, $justAllowed)) { $allowIN  = 1; continue; } }
   }
      
   /* 
    * Evaluaci?n.
    * Niveles: 0=No Permitido, 1=Bajo, 2=Medio, 3=Alto, 4=Avanzado.
    */
   if (($numIN and !$letMayIN  and !$letMinIN and !$allowIN) ||   // Solo numeros.
      (!$numIN and $letMayIN   and !$letMinIN and !$allowIN) ||   // Solo mayusculas.
      (!$numIN and !$letMayIN  and $letMinIN  and !$allowIN) ||   // Solo minusculas.
      (!$numIN and !$letMayIN  and !$letMinIN and $allowIN)  ||   // Solo simbolos.
      (strlen($passwd) >= 1))  { $lvl = 1; }                      // Y SI CONTIENE ALMENOS 1 CARACTER.

   if (($numIN and ($letMayIN  || $letMinIN) and !$allowIN) ||    // Numeros y letras (mayus ? minus).
      ($numIN  and !($letMayIN || $letMinIN) and $allowIN)  ||    // Numeros y simbolos.
      (!$numIN and ($letMayIN  and $letMinIN) and !$allowIN) ||   // letras Mayus ? y Letras Minus.
      (!$numIN and ($letMayIN  || $letMinIN) and $allowIN)  and   // letras (mayus ? minus) y simbolos.
      (strlen($passwd) >= 5))  { $lvl = 2; }                      // Y SON 5 O MAS CARACTERES.

   if (($numIN and $letMayIN   and $letMinIN  and !$allowIN) ||   // Numeros, Letras Mayus y Letras Minus.
      ($numIN  and ($letMayIN  || $letMinIN) and $allowIN)  and   // Numeros, Letras (mayus o minus) y simbolos.
      (strlen($passwd) >= 8))  { $lvl = 3; }                      // Y SON 8 O MAS CARACTERES.

   if (($numIN and $letMayIN   and $letMinIN  and $allowIN)  and  // Numeros, Letras Mayus, Letras Minus y Simbolos.
      (strlen($passwd) >= 10)) { $lvl = 4; }                      // Y SON 10 O MAS CARACTERES.
   
   // [DEVOLVEMOS EL VALOR]
   return $lvl;
}


//Validar emails, ej. first.last@domain.co.uk
//Return Boolean
function validEmail($string) {
   $regexp = "/^[^0-9][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}$/";
   return preg_match($regexp, $string);
}

//Validar telefono, formatos permitidos 000 000 0000,(000)-000-0000
function validPhone($string) {
   $regexp = "#^(?d{3})?[s.-]?d{3}[s.-]?d{4}$#";
   return preg_match($regexp, $string);
}

//Validar Codigo Posta, formatos permitidos xxxxx y xxxxx-xxxx
function validCP($string) {
   $regexp = "/^[0-9]{5,5}([- ]?[0-9]{4,4})?$/";
   return preg_match($regexp, $string);
}

//Validar Fecha con formato DD-MM-YYYY, con separadores (/),(-) y (.);
function validDate($string){
   $sep = "[/-.]";
   $regexp = "#^(((0?[1-9]|1d|2[0-8]){$sep}(0?[1-9]|1[012])|(29|30){$sep}(0?[13456789]|1[012])|31{$sep}(0?[13578]|1[02])){$sep}(19|[2-9]d)d{2}|29{$sep}0?2{$sep}((19|[2-9]d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$#";
   return preg_match($regexp, $string);
}

//Validar IP 0.0.0.0 a 255.255.255.255
function validIP($string) {
   $val_0_to_255 = "(25[012345]|2[01234]d|[01]?dd?)";
   $regexp = "#^($val_0_to_255.$val_0_to_255.$val_0_to_255.$val_0_to_255)$#";
   return preg_match($regexp, $string, $matches);
}

function randomPasswd($strLen){
   // set ASCII range for random character generation
   $lower_ascii_bound = 50; // "2"
   $upper_ascii_bound = 122; // "z"
   
   // Exclude special characters and some confusing alphanumerics
   // o,O,0,I,1,l etc
   $notuse = array(58,59,60,61,62,63,64,73,79,91,92,93,94,95,96,108,111);
   $i = 0;
   $password = '';
   while ($i < $strLen){
      mt_srand((double)microtime() * 1000000);
      // random limits within ASCII table
      $randnum = mt_rand($lower_ascii_bound, $upper_ascii_bound);
      if (!in_array($randnum, $notuse)){
         $password = $password.chr($randnum);
         $i++;					
      };
   };
   return $password;
}

              
/**
 * Reemplaza todos los acentos por sus equivalentes sin ellos
 *
 * @param $string
 *  string la cadena a sanear
 *
 * @return $string
 *  string saneada
 */
function deleteSpecialChars($string, $allowUnknown=0) {
   $string = trim($string);
 
   $string = str_replace(
      array('?', '?', '?', '?', '?', '?', '?', '?', '?'),
      array('a', 'a', 'a', 'a', 'a', 'A', 'A', 'A', 'A'),
      $string
   );
 
   $string = str_replace(
      array('?', '?', '?', '?', '?', '?', '?', '?'),
      array('e', 'e', 'e', 'e', 'E', 'E', 'E', 'E'),
      $string
   );
 
   $string = str_replace(
      array('?', '?', '?', '?', '?', '?', '?', '?'),
      array('i', 'i', 'i', 'i', 'I', 'I', 'I', 'I'),
      $string
   );
 
   $string = str_replace(
      array('?', '?', '?', '?', '?', '?', '?', '?'),
      array('o', 'o', 'o', 'o', 'O', 'O', 'O', 'O'),
      $string
   );
 
   $string = str_replace(
      array('?', '?', '?', '?', '?', '?', '?', '?'),
      array('u', 'u', 'u', 'u', 'U', 'U', 'U', 'U'),
      $string
   );
 
   $string = str_replace(
      array('?', '?', '?', '?'),
      array('n', 'N', 'c', 'C',),
      $string
   );
 
   //Esta parte se encarga de eliminar cualquier caracter extra?o
   if (!$allowUnknown) {
      $string = str_replace(
         array("\\", "?", "?", "-", "~", "#", "@", "|", "!", "\"",
               "?", "$", "%", "&", "/", "(", ")", "?", "'", "?",
               "?", "[", "^", "`", "]", "+", "}", "{", "?", "?",
               ">", "<", ";", ",", ":", "."),
         '',
         $string
      );
   }
 
   return $string;
}

// Funci?n que calcula la Fecha Actual.
function Fecha() {
   $fecha = '';
   
	$nombreMes = array(
		1 => "Enero",
		2 => "Febrero",
		3 => "Marzo",
		4 => "Abril",
		5 => "Mayo",
		6 => "Junio",
		7 => "Julio",
		8 => "Agosto",
		9 => "Septiembre",
		10 => "Octubre",
		11 => "Noviembre",
		12 => "Diciembre"
	);
	$nombreDiaSemana = array(
		"Mon" => "Lunes",
		"Tue" => "Martes",
		"Wed" => "Miercoles",
		"Thu" => "Jueves",
		"Fri" => "Viernes",
		"Sat" => "S?bado",
		"Sun" => "Domingo",
	); 
   
   $fecha['nombreMes'] = $nombreMes[date("n")];
   $fecha['nombreDiaSemana'] = $nombreDiaSemana[date("D")];
   $fecha['numeroDiaMes'] = date("d");
   $fecha['anio'] = date("Y");
	
	return $fecha;
}


/**
 *  An example CORS-compliant method.  It will allow any GET, POST, or OPTIONS requests from any
 *  origin.
 *
 *  In a production environment, you probably want to be more restrictive, but this gives you
 *  the general idea of what is involved.  For the nitty-gritty low-down, read:
 *
 *  - https://developer.mozilla.org/en/HTTP_access_control
 *  - http://www.w3.org/TR/cors/
 *
 */
function cors() {

    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }

    echo "You have CORS!";
}

function printlog($str){
   echo "<pre>";
   print_r($str);
   echo "<pre>";
}

?>