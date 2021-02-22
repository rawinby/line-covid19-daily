<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Frontend extends CI_Controller {

	public function __construct() {
		parent::__construct();
	}

	public function stat()
	{	
		$getApi['url'] = 'https://covid19.th-stat.com/api/open/today';
		$getApi['token'] = "";
		$res_covid = json_decode(getData($getApi),true);

		// var_dump(
		// 	$res_covid
		// );

		$data = array();
		//---
		$ud_dt = explode(' ', $res_covid['UpdateDate']);
		$ud_d_en = substr($ud_dt[0],6,4).'-'.substr($ud_dt[0],3,2).'-'.substr($ud_dt[0],0,2);
		$ud_dt_en = substr($ud_dt[0],6,4).'-'.substr($ud_dt[0],3,2).'-'.substr($ud_dt[0],0,2).' '.$ud_dt[1];
		$data['res_covid'] = $res_covid;
		$data['update_date'] = $ud_dt_en;
		
		
		$this->template_frontend->view('covid-stat', $data);
		

	}















}