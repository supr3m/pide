<?php
session_start();
echo '<pre>';
print_r($_SESSION);
print_r($_SERVER);
echo '</pre>';
echo '<br /><br /><br /><br /><br />';
phpinfo();
?>