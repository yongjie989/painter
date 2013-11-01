<?php
if(!$_POST['email']){
    echo 'Need email.';
    exit;
};

$upload_path = '/home/android/upload/'.$_POST['email'];
$filename = $_FILES['file'];
$file_tmp_name = $_FILES['tmp_name'];

if(!is_dir($upload_path)){
    mkdir($upload_path);
};
if( move_uploaded_files($file_tmp_name, $upload_path.$filename) ){
    echo "File was successfully uploaded";
};
?>
