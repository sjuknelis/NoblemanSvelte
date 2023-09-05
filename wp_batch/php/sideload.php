<?php
	require_once(ABSPATH . "wp-admin/includes/media.php");
    require_once(ABSPATH . "wp-admin/includes/file.php");
    require_once(ABSPATH . "wp-admin/includes/image.php");

	function sideload_file( $file, $post_id = 0, $desc = null ) {
		$file_array = array(
			"name" => wp_basename($file),
			"tmp_name" => $file
		);

		$id = media_handle_sideload( $file_array, $post_id, $desc );

		if ( is_wp_error( $id ) ) {
			@unlink( $file_array['tmp_name'] );
			return $id;
		}

		return $id;
	}
?>