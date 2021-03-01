<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Frontend extends CI_Controller {

	public function __construct() {
		parent::__construct();
	}

	public function stat()
	{	
		$data = array();
		//---
		$query = $this->db->query('SELECT * FROM covid19_stat ORDER BY id DESC LIMIT 1 ');
		$data['f'] = $query->row_array();
		
		$this->template_frontend->view('covid-stat', $data);
		

	}















}