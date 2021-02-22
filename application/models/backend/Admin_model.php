<?php

class Admin_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->zerowaste_db = $this->load->database('default',TRUE);
    }

    public function count_data()
	{
        $query = $this->zerowaste_db->select('
                                        (SELECT COUNT(*) FROM zrw_urban_area) AS count_urban,
                                        (SELECT COUNT(*) FROM zrw_school_area) AS count_school
                                    ')
                                    ->get();
                                    
        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        return $query->row_array();
    }

    public function count_waiting_for_approve()
	{
        $query = $this->zerowaste_db->query("
                                        SELECT COUNT(*) AS count_waiting_for_approve FROM admin_role WHERE system_id = (SELECT system_id FROM admin_config_system WHERE system_code = '". $this->config->item('system_code') ."')
                                        AND admin_id NOT IN (SELECT ref_admin_id FROM zrw_admin_profile)
                                    ");
                                    
        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        return $query->row_array();
    }

    public function get_admin_profile($user_id='')
	{
        $query = $this->zerowaste_db->select('*')
                                ->from('zrw_admin_profile')
                                ->where(['ref_admin_id' => $user_id,
                                        'admin_isactive' => 1
                                ])
                                ->get();
        return $query->row_array();
    }

    public function get_admin_allow($user_id='')
	{
        $query = $this->zerowaste_db->select('sga.sub_grp_allow_name')
                                ->from('zrw_admin_province AS ar')
                                ->join('zrw_sub_group_province AS sgp', 'ar.prov_code = sgp.prov_code', 'inner')
                                ->join('zrw_sub_group_allow AS sga', 'sgp.sub_grp_allow_id = sga.sub_grp_allow_id', 'inner')
                                ->where(['ar.zrw_admin_id' => $user_id])
                                ->group_by('sga.sub_grp_allow_name')
                                ->get();
        return $query->result_array();
    }

    public function get_admin_province($user_id='')
	{
        $query = $this->zerowaste_db->select('pr.prov_name')
                                ->from('zrw_admin_province AS ar')
                                ->join('tbl_province AS pr', 'ar.prov_code = pr.prov_code', 'inner')
                                ->where(['ar.zrw_admin_id' => $user_id])
                                ->get();
        return $query->result_array();
    }

    public function add_admin_log($func_code,$description,$admin_id,$admin_full_name)
	{
        $data = array(
            'zrw_func_code' => $func_code,
            'description' => $description,
            'zrw_admin_id' => $admin_id,
            'log_admin_full_name' => $admin_full_name,
            'log_datetime' => get_current_date(),
        );
    
        if($this->db->insert('zrw_admin_log',$data)){
            return true;
        }else{
            return false;
        }
    }

}