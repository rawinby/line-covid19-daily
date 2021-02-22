<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Error_page extends CI_Controller {
	
	public function error_404()
	{		
		$data = array();
		//---
		$data['page_title'] = 'Error 404';
		$data['menu'] = false;
		
		$this->template_frontend->view('error_page/error_404', $data);
	}
}