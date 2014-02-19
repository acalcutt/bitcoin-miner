<?php

$stratumProxy = "http://localhost";
$workerName = "1NEQ5xMFVwS4z11rSG6iGgadGGSUunK7Md";
$workerPass = "x";

$data_string = file_get_contents('php://input');
//$data_string =  '{"method": "getblocktemplate", "params": [], "id": "0"}';
//$data_string ='{"params": [], "method": "getwork", "id": "json"}';

$ch = curl_init($stratumProxy);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_USERPWD, $workerName.":".$workerPass);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_PORT, 3372);  
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',                                                                                
    'Content-Length: ' . strlen($data_string))                                                                       
);

echo curl_exec($ch);

?>
