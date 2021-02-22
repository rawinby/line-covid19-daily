<?php

class View_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->zerowaste_db = $this->load->database('default',TRUE);
    }
    
    public function learning_center($type='', $page='', $per_page='', $school_id='', $q='')
	{
        if(!empty($q)){
            $this->zerowaste_db->like('vw_learning_center.CENTER_NAME', $q, 'both');
        }
        $wh = '';
        if(!empty($school_id)){
            $wh .= " AND zrw_school_area.school_id = '". $school_id ."' ";
        }
        if($type != 'total_rows'){
            $this->zerowaste_db->limit($per_page, $page);
        }
        $query = $this->zerowaste_db->select('vw_learning_center.*, tbl_province.prov_name')
                                    ->from('vw_learning_center')
                                    ->join('tbl_province', 'vw_learning_center.PROV_CODE = tbl_province.prov_code', 'inner')
                                    ->join('zrw_school_area', "vw_learning_center.CENTER_ID = zrw_school_area.ref_center_id ". $wh, 'left')
                                    ->order_by('zrw_school_area.ref_center_id DESC, vw_learning_center.CENTER_ID ASC')
                                    ->get();

        if($type == 'total_rows'){
            // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()).'</pre>'; exit;
            return $query->num_rows();
        }else{
            // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()).'</pre>'; exit;
            return $query->result_array();
        }
    }

    public function learning_center_view($center_id='')
	{
        $query = $this->zerowaste_db->select('
                                        vlc.*,
                                        pr.prov_name AS PROV_NAME,
                                        am.amp_name AS AMP_NAME,
                                        ta.tam_name AS TAM_NAME
                                    ')
                                    ->from('vw_learning_center AS vlc')
                                    ->join('tbl_province AS pr', 'vlc.PROV_CODE = pr.prov_code', 'inner')
                                    ->join('tbl_amphoe AS am', 'vlc.amp_code = am.amp_code', 'inner')
                                    ->join('tbl_tambon AS ta', 'vlc.tam_code = ta.tam_code', 'inner')
                                    ->where('vlc.CENTER_ID', $center_id)
                                    ->get();
        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        return $query->row_array();
    }

    public function learning_file_view($center_id='')
	{
        $query = $this->zerowaste_db->select('*')
                                    ->from('vw_learning_file')
                                    ->where('vw_learning_file.CENTER_ID', $center_id)
                                    ->get();
        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        return $query->result_array();
    }

    
}