<?php
require_once('libs/php/functions.php');
$logout = (isset($_REQUEST['url']) ? $_REQUEST['url'] : null);
$continue = (isset($_REQUEST['continue']) ? $_REQUEST['continue'] : null);
$url = $logout."&continue=".$continue;

session_start();
session_unset(); 
session_destroy();

header("Location: ".$url);
?>