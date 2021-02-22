<?php

class Systemhistory_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->zerowaste_db = $this->load->database('default',TRUE);
    }
    

    public function systemhistory_show($type='', $page='', $per_page='', $q=array())
	{

        if($type != 'total_rows'){
            $this->zerowaste_db->limit($per_page, $page);
        }


        

        if(!empty($q)){

            if(!empty($q['s_name'])){
                $query = $this->zerowaste_db->like('zrw_admin_log.log_admin_full_name', $q['s_name'], 'both');
            }
            if(!empty($q['s_lastname'])){
                $query = $this->zerowaste_db->like('zrw_admin_log.log_admin_full_name', $q['s_lastname'], 'both');
            }
            if(!empty($q['s_from_date']) && !empty($q['s_to_date'])){ 

                $query =   $this->zerowaste_db->where("zrw_admin_log.log_datetime BETWEEN '". chg_date_en_query($q['s_from_date']." 00:00:00"). "' AND '". chg_date_en_query($q['s_to_date']." 23:59:59")."'");


            }
            
           

        }       


        $query = $this->zerowaste_db->select('
                                            zrw_admin_log.zrw_admin_log_id, 
                                            zrw_admin_log.zrw_func_code, 
                                            zrw_admin_log.description, 
                                            zrw_admin_log.zrw_admin_id, 
                                            zrw_admin_log.log_admin_full_name, 
                                            zrw_admin_log.log_datetime
                                    ')
                                    ->from('zrw_admin_log')        
                                    ->join('zrw_config_function', 'zrw_admin_log.zrw_func_code = zrw_config_function.zrw_func_code', 'left')
                                    ->order_by('zrw_admin_log.zrw_admin_log_id','ASC')
                                    ->get();

                                
        // print_r($this->zerowaste_db->last_query()); exit;  //view query

        if($type == 'total_rows'){
            return $query->num_rows();
        }else{
            return $query->result_array();
        }
        
    }

    public function get_roleadmin($admin_id='') //กรณี Edit 
	{
        if(!empty($admin_id)){
            $this->zerowaste_db->where("system_id = ( SELECT system_id FROM admin_config_system WHERE system_code = '6308zrw')", NULL, FALSE);
            $this->zerowaste_db->where('admin_role.admin_id', $admin_id);
            $query = $this->zerowaste_db->select('
                                            admin_role.*, 
                                            zrw_admin_profile.zrw_admin_id, 
                                            zrw_admin_profile.ref_admin_id,
                                            deqp_com_user.firstname, 
                                            deqp_com_user.lastname,
                                            zrw_admin_profile.admin_isactive,
                                            zrw_admin_profile.admin_level_code,
                                            zrw_admin_profile.admin_role_code,
                                        ')
                                        ->from('admin_role')        
                                        ->join('deqp_com_user', 'admin_role.admin_id = deqp_com_user.id', 'left')
                                        ->join('zrw_admin_profile', 'admin_role.admin_id = zrw_admin_profile.ref_admin_id', 'left')
                                        ->join('zrw_admin_province', 'zrw_admin_profile.zrw_admin_id = zrw_admin_province.zrw_admin_id', 'left')
                                        ->order_by('zrw_admin_profile.zrw_admin_id','ASC')
                                        ->get();
            
            // print_r($this->zerowaste_db->last_query()); exit;  //view query

            return $query->row_array();
        }
    }

    // get_admin_prov_chk
    public function get_admin_prov_chk($admin_id='') //กรณี Edit 
	{
            if(!empty($admin_id))
            {
            $this->zerowaste_db->where('zrw_admin_profile.ref_admin_id',$admin_id);
            }

            $query = $this->zerowaste_db->select('zrw_admin_province.prov_code, tbl_province.prov_name')
                        ->from('zrw_admin_province')
                        ->join('zrw_admin_profile', 'zrw_admin_province.zrw_admin_id = zrw_admin_profile.zrw_admin_id', 'inno')
                        ->join('tbl_province', 'zrw_admin_province.prov_code = tbl_province.prov_code', 'left')
                        // ->group_by('zrw_sub_group_province.prov_code, tbl_province.prov_name')
                        ->order_by('zrw_admin_province.prov_code','ASC')
                        ->get();
            // print_r($this->zerowaste_db->last_query()); exit;  //view query

            return $query->result_array();
        //}
    }



    public function get_roleadmin_chk($sub_grp_allow_id='') //กรณี Edit & Chechked Checkbok
	{
        if(!empty($sub_grp_allow_id))
        {
        $zrw_admin_id = $this->zerowaste_db
                    ->query('SELECT zrw_admin_id FROM zrw_admin_profile WHERE ref_admin_id ='.get_session_login())
                    ->row()->zrw_admin_id;

            if(!empty($sub_grp_allow_id))
            {
            $this->zerowaste_db->where('zrw_sub_group_province.sub_grp_allow_id',$sub_grp_allow_id);
            }
            else
            {
            $query = $this->zerowaste_db->where('zrw_sub_group_allow.sub_grp_allow_id  IN ( 
            SELECT a.sub_grp_allow_id FROM zrw_sub_group_province a
            INNER JOIN zrw_sub_group_allow b ON b.sub_grp_allow_id =  a.sub_grp_allow_id
            WHERE a.prov_code IN (SELECT prov_code FROM zrw_admin_province WHERE zrw_admin_id = '.$zrw_admin_id.')
            GROUP BY a.sub_grp_allow_id  )', NULL, FALSE);

            }
            $query = $this->zerowaste_db->select('zrw_sub_group_province.prov_code, tbl_province.prov_name')
                        ->from('zrw_sub_group_province')
                        ->join('zrw_sub_group_allow', 'zrw_sub_group_province.sub_grp_allow_id = zrw_sub_group_allow.sub_grp_allow_id', 'left')
                        ->join('tbl_province', 'zrw_sub_group_province.prov_code = tbl_province.prov_code', 'left')
                        ->group_by('zrw_sub_group_province.prov_code, tbl_province.prov_name')
                        ->order_by('zrw_sub_group_province.prov_code','ASC')
                        ->get();
            // print_r($this->zerowaste_db->last_query()); exit;  //view query

            return $query->result_array();
        }
    }


    // public function show_province_list()
	// {
    //     $query = $this->zerowaste_db->select('prov_code, prov_name')
    //                                 ->from('tbl_province')
    //                                 // ->where('active_status','A')
    //                                 ->get();
    //     return $query->result_array();
    // }



    //=========================== END Masterdata =====================//



    
}