<?php
    //opcache_reset();
    //error_reporting(E_ERROR);

    require_once "wp-load.php";

    require_once "sideload.php";

    $post = array(
        "post_title" => $_POST["title"],
        "post_content" => $_POST["content"],
        "post_status" => $_POST["status"],
        "ID" => @$_POST["id"] ?: 0
    );

    $result = wp_insert_post($post);
    if ( ! $result || is_wp_error($result) ) die("err");
    $post_id = intval($result);

    if ( $_POST["feat_path"] != "" ) {
        $feat_upload_path = "wp-content/uploads/" . basename($_POST["feat_path"]);
        copy($_POST["feat_path"],$feat_upload_path);
        $feat_id = sideload_file($feat_upload_path,$post_id);
        set_post_thumbnail($post_id,$feat_id);
    }
    
    echo $post_id;
?>