<?php

class School_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->zerowaste_db = $this->load->database('default',TRUE);
        $this->load->model('Masterdata_model'); // Load Model
    }
    
    public function school_show($type='', $page='', $per_page='', $q=array())
	{

        // Show ตาม admin_level_code
        $a_list =  $this->Masterdata_model->get_sub_grp_prov(); // Access Method
        $province_list =  implode(",", array_column($a_list, "prov_code"));
        $query = $this->zerowaste_db->where('zrw_school_area.prov_code IN ('.$province_list.')', NULL, FALSE);


        if(!empty($q)){


            if(!empty($q['s_area_name'])){
                $query = $this->zerowaste_db->like('zrw_school_area.area_name', $q['s_area_name'], 'both');
            }


            if(!empty($q['s_office'])){ 
                //   
            }
            if(!empty($q['s_prov_code'])){
                $query = $this->zerowaste_db->where('zrw_school_area.prov_code', $q['s_prov_code']);
            }
            if(!empty($q['s_school_year'])){
                $query = $this->zerowaste_db->where('zrw_school_yearly.school_year', $q['s_school_year']);
            }
            if(!empty($q['s_school_grp_code'])){
                $query = $this->zerowaste_db->where('zrw_school_yearly.school_grp_code', $q['s_school_grp_code']);
            }
            if(!empty($q['s_ref_center_id'])){
                $query = $this->zerowaste_db->where('zrw_school_area.ref_center_id !=',null);  
            }


        }        



        if($type != 'total_rows'){
            $this->zerowaste_db->limit($per_page, $page);
        }
        $query = $this->zerowaste_db->select('
                                        zrw_school_area.school_id,
                                        zrw_school_yearly.school_year_id,
                                        zrw_school_area.area_name,
                                        zrw_school_yearly.school_grp_code,
                                        tbl_province.prov_name,
                                        zrw_school_yearly.school_year,
                                        zrw_school_area.date_created,
                                        zrw_school_area.date_modified,
                                        zrw_school_area.ref_center_id
                                    ')
                                    ->from('zrw_school_area')
                                    ->join('tbl_province', 'zrw_school_area.prov_code = tbl_province.prov_code', 'inner')
                                    ->join('zrw_school_yearly', "zrw_school_area.school_id = zrw_school_yearly.school_id", 'left')                                    
                                    ->order_by('1','ASC')
                                    ->get();
                                    
        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        if($type == 'total_rows'){
            return $query->num_rows();
        }else{
            return $query->result_array();
        }
        
    }

    public function school_total_areas($type='')
	{
         // Show ตาม admin_level_code
         $a_list =  $this->Masterdata_model->get_sub_grp_prov(); // Access Method
         $province_list =  implode(",", array_column($a_list, "prov_code"));
         $query = $this->zerowaste_db->where('zrw_school_area.prov_code IN ('.$province_list.')', NULL, FALSE);


         $query = $this->zerowaste_db->select('
                                        zrw_school_area.school_id
                                    ')
                                    ->from('zrw_school_area')
                                    ->order_by('1','ASC')
                                    ->get();
                                    
        // print_r($this->zerowaste_db->last_query()); exit;  //view query

        
        
        if($type == 'total_areas'){
            
            return $query->num_rows();
        }else{
            return $query->result_array();
        }
    }

    public function get_school_area($school_id='') //row
	{
        if(!empty($school_id)){
            $this->zerowaste_db->where('school_id',$school_id);        
            $query = $this->zerowaste_db->select('*')
                                        ->from('zrw_school_area')
                                        ->get();
            return $query->row_array();
        }
    }

    // For AutoComplete

    public function get_area()
    {

        $ref_admin_id = get_session_login();
        $admin_role_code = get_session_login_role('admin_role_code'); //10 20
        $admin_level_code = get_session_login_role('admin_level_code'); //10 20 30


        // Test General Admin - ระดับประเทศ
            // $ref_admin_id = 594;
            // $admin_role_code = 20;
            // $admin_level_code = 10;

        // Test General Admin - ระดับสำนักฯ
            // $ref_admin_id = 10654;
            // $admin_role_code = 20;
            // $admin_level_code = 20;


        // Test General Admin - ระดับจังหวัด
            // $ref_admin_id = 10655;
            // $admin_role_code = 20;
            // $admin_level_code = 30;


        if(!empty($ref_admin_id))
        {

            $zrw_admin_id = $this->zerowaste_db
                                ->query('SELECT zrw_admin_id FROM zrw_admin_profile WHERE ref_admin_id ='.$ref_admin_id)
                                ->row()->zrw_admin_id;
            

            if($admin_role_code==10) // Super Admin
            {
                //
            }
            else if($admin_role_code==20) // General Admin
            {
                if($admin_level_code==10) // General Admin - ระดับประเทศ
                {
                    //
                }
                else if($admin_level_code==20) // General Admin - ระดับสำนักฯ
                {
                    
                    $query = $this->zerowaste_db->where('zrw_school_area.prov_code  IN ( 
                        SELECT zrw_sub_group_province.prov_code 
                        FROM zrw_sub_group_province 
                        WHERE zrw_sub_group_province.sub_grp_allow_id IN 
                        (
                            SELECT
                                a.sub_grp_allow_id
                            FROM
                                zrw_sub_group_province a
                            INNER JOIN zrw_sub_group_allow b ON b.sub_grp_allow_id = a.sub_grp_allow_id
                            WHERE
                                a.prov_code IN (
                                    SELECT
                                        prov_code
                                    FROM
                                        zrw_admin_province
                                    WHERE
                                        zrw_admin_id = '.$zrw_admin_id.'
                                )
                            GROUP BY a.sub_grp_allow_id
                        )
                        GROUP BY zrw_sub_group_province.prov_code )', NULL, FALSE);

                }
                else if($admin_level_code==30) // General Admin - ระดับจังหวัด
                {

                    $query = $this->zerowaste_db->where('zrw_school_area.prov_code  IN ( 
                        SELECT zrw_admin_province.prov_code FROM zrw_admin_province WHERE zrw_admin_province.zrw_admin_id = '.$zrw_admin_id.'
                        GROUP BY zrw_admin_province.prov_code  )', NULL, FALSE);

                }

            }
        }

        
        $query = $this->zerowaste_db->select('zrw_school_area.school_id, zrw_school_area.area_name')
                                    ->from('zrw_school_area')
                                    ->order_by('zrw_school_area.area_name','ASC')
                                    ->get();

        // print_r($this->zerowaste_db->last_query()); exit;  //view query

        return $query->result_array();
    }



    public function check_school_year_duplicate($school_id='', $school_year_id='', $school_year='')
    {
        if(!empty($school_year_id))
        {
            $this->zerowaste_db->where('school_year_id !=',$school_year_id); 

        }
        
        $this->zerowaste_db->where('zrw_school_yearly.school_id', $school_id);
        $this->zerowaste_db->where('zrw_school_yearly.school_year',$school_year);
        $query = $this->zerowaste_db->select('*')
                                    ->from('zrw_school_yearly')
                                    ->get();

        // print_r($this->zerowaste_db->last_query( )); exit;  //view query
        return $query->num_rows();

    } //check_urban_year_duplicate


    public function get_school_yearly($school_id='') // list
	{
        if(!empty($school_id)){
            $this->zerowaste_db->where('school_id',$school_id);        
            $query = $this->zerowaste_db->select('*')
                                        ->from('zrw_school_yearly')
                                        ->get();
            return $query->result_array();
        }
    }

    public function get_school_yearly_view($school_year_id='') // list
	{
        if(!empty($school_year_id)){
            $this->zerowaste_db->where('school_year_id',$school_year_id);        
            $query = $this->zerowaste_db->select('*')
                                        ->from('zrw_school_yearly')
                                        ->get();
            return $query->row_array();
        }
    }

    public function get_school_yearly_fileorclip($school_year_id='') // list
	{
        if(!empty($school_year_id)){
            $this->zerowaste_db->where('school_year_id',$school_year_id);        
            $query = $this->zerowaste_db->select('*')
                                        ->from('zrw_area_attachment')
                                        ->get();
            return $query->result_array();
        }
    }



    public function get_filename($school_id=''){
        if(!empty($school_id)){    
            $this->db->select('cover_name');
            $this->db->from('zrw_school_area');
            $this->db->where('school_id',$school_id);
            return $this->db->get()->row()->cover_name;
        }
    }

    public function get_school_all_fileorclip($school_id='')
    {

        if(!empty($school_id)){

            $this->zerowaste_db->where('zrw_school_yearly.school_id',$school_id);        
            $query = $this->zerowaste_db->select('*')
                                        ->from('zrw_area_attachment')
                                        ->join('zrw_school_yearly', 'zrw_area_attachment.school_year_id = zrw_school_yearly.school_year_id', 'inner')
                                        ->get();
            return $query->result_array();
        }

    }
    
}