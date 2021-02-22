<?php

class Masterdata_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->zerowaste_db = $this->load->database('default',TRUE);
    }
    
    public function province_list()
	{
        $query = $this->zerowaste_db->select('*')
                                    ->from('tbl_province')
                                    // ->where('active_status','A')
                                    ->get();
        return $query->result_array();
    }

    public function amphoe_list($prov_code='')
	{
        if(!empty($prov_code)){
            $this->zerowaste_db->where('prov_code',$prov_code);
        
            $query = $this->zerowaste_db->select('*')
                                        ->from('tbl_amphoe')
                                        ->get();
            return $query->result_array();
        }
    }

    public function tambon_list($amp_code='')
	{
        if(!empty($amp_code)){
            $this->zerowaste_db->where('amp_code',$amp_code);
        
            $query = $this->zerowaste_db->select('*')
                                        ->from('tbl_tambon')
                                        ->get();
            return $query->result_array();
        }
    }


    //----- For search by auth --------//
    public function get_office() //สำนักงานสิ่งแวดล้อม
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
                    $query = $this->zerowaste_db->where('zrw_sub_group_province.prov_code  IN ( SELECT prov_code FROM zrw_admin_province WHERE zrw_admin_id = '.$zrw_admin_id.' )', NULL, FALSE);

                }
                else if($admin_level_code==30) // General Admin - ระดับจังหวัด
                {
                    // ไม่สามารถเลือกสิ่งแวดล้อมได้ และต้อง Disabled select ด้วย
                    $query = $this->zerowaste_db->where('zrw_sub_group_province.prov_code = 999', NULL, FALSE);
                }

            }
        }


            $query = $this->zerowaste_db->select('zrw_sub_group_allow.sub_grp_allow_id, zrw_sub_group_allow.sub_grp_allow_name')
                                    ->from('zrw_sub_group_province')
                                    ->join('zrw_sub_group_allow', 'zrw_sub_group_allow.sub_grp_allow_id = zrw_sub_group_province.sub_grp_allow_id', 'inner')
                                    ->group_by('zrw_sub_group_allow.sub_grp_allow_id, zrw_sub_group_allow.sub_grp_allow_name')
                                    ->order_by('zrw_sub_group_allow.sub_grp_allow_id','DESC')
                                    ->get();
            // print_r($this->zerowaste_db->last_query()); exit;  //view query

            return $query->result_array();
            
    }

    // For search

    public function get_sub_grp_prov($sub_grp_allow_id='')
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
                    
                    $query = $this->zerowaste_db->where('zrw_sub_group_allow.sub_grp_allow_id  IN ( 
                        SELECT a.sub_grp_allow_id FROM zrw_sub_group_province a
                        INNER JOIN zrw_sub_group_allow b ON b.sub_grp_allow_id =  a.sub_grp_allow_id
                        WHERE a.prov_code IN (SELECT prov_code FROM zrw_admin_province WHERE zrw_admin_id = '.$zrw_admin_id.')
                        GROUP BY a.sub_grp_allow_id  )', NULL, FALSE);

                }
                else if($admin_level_code==30) // General Admin - ระดับจังหวัด
                {
                    // SELECT prov_code FROM zrw_admin_province WHERE zrw_admin_province.zrw_admin_id = 4


                    $query = $this->zerowaste_db->where('zrw_sub_group_province.prov_code  IN ( 
                        SELECT zrw_admin_province.prov_code FROM zrw_admin_province WHERE zrw_admin_province.zrw_admin_id = '.$zrw_admin_id.'
                        GROUP BY zrw_admin_province.prov_code  )', NULL, FALSE);

                }

            }
        }

        

        if(!empty($sub_grp_allow_id))
        {
            $this->zerowaste_db->where('zrw_sub_group_province.sub_grp_allow_id',$sub_grp_allow_id);
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

    



    public function get_role_level_code($ref_admin_id='',$type='')
    {
        if(!empty($ref_admin_id)){
            
            if($type=='admin_level_code'){
                // return $rows['admin_level_code'];

                return $this->zerowaste_db
                    ->query('SELECT admin_role_code, admin_level_code FROM zrw_admin_profile WHERE ref_admin_id ='.$ref_admin_id)
                    ->row()->admin_level_code;

            }
            if($type=='admin_role_code'){
                // return $rows['admin_role_code'];
                return $this->zerowaste_db
                    ->query('SELECT admin_role_code, admin_level_code FROM zrw_admin_profile WHERE ref_admin_id ='.$ref_admin_id)
                    ->row()->admin_role_code;

            }
        }
    }
    //----- end For search by auth --------//





    //=========================== BEGIN Masterdata ===================//

    public function masterdata_show($type='', $page='', $per_page='', $q=array())
	{


        if($type != 'total_rows'){
            $this->zerowaste_db->limit($per_page, $page);
        }
        $query = $this->zerowaste_db->select("
                                        zrw_sub_group_allow.sub_grp_allow_id, 
                                        zrw_sub_group_allow.sub_grp_allow_name, 
                                        zrw_sub_group_allow.sub_grp_allow_abbr,
                                        (SELECT prov_name + ' / ' AS 'data()' FROM zrw_sub_group_province INNER JOIN tbl_province ON  zrw_sub_group_province.prov_code = tbl_province.prov_code  WHERE zrw_sub_group_province.sub_grp_allow_id = zrw_sub_group_allow.sub_grp_allow_id  FOR XML PATH('') ) AS provincs
                                        ")
                                    ->from('zrw_sub_group_allow')                                  
                                    ->order_by('zrw_sub_group_allow.sub_grp_allow_id','ASC')
                                    ->get();
                                    
        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        if($type == 'total_rows'){
            return $query->num_rows();
        }else{
            return $query->result_array();
        }
        
    }

    public function get_sub_grp_allow($sub_grp_allow_id='') //กรณี Edit 
	{
        if(!empty($sub_grp_allow_id)){
            $this->zerowaste_db->where('sub_grp_allow_id',$sub_grp_allow_id);        
            $query = $this->zerowaste_db->select('*')
                                        ->from('zrw_sub_group_allow')
                                        ->get();
            return $query->row_array();
        }
    }

    // get_sub_grp_prov_chk
    public function get_sub_grp_prov_chk($sub_grp_allow_id='') //กรณี Edit 
	{
            if(!empty($sub_grp_allow_id))
            {
            $this->zerowaste_db->where('zrw_sub_group_province.sub_grp_allow_id',$sub_grp_allow_id);
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
        //}
    }


    public function show_province_list()
	{
        $query = $this->zerowaste_db->select('prov_code, prov_name')
                                    ->from('tbl_province')
                                    ->order_by('tbl_province.prov_name','ASC')
                                    ->get();
        return $query->result_array();
    }

    //check_prov_duplicate
    public function check_prov_duplicate($sub_grp_allow_id='',$prov_code=array())
    {
        // print_r($prov_code);

       $province_list =  implode(",", $prov_code);


        $query = $this->zerowaste_db->where('zrw_sub_group_province.prov_code IN ('.$province_list.')', NULL, FALSE);


        if(!empty($sub_grp_allow_id))
        {
            $this->zerowaste_db->where('zrw_sub_group_province.sub_grp_allow_id !=',$sub_grp_allow_id); 

        }
        
        // $this->zerowaste_db->where('zrw_sub_group_province.prov_code',$prov_code);

        $query = $this->zerowaste_db->select('zrw_sub_group_province.*')
                                    ->from('zrw_sub_group_province')
                                    ->join('zrw_sub_group_allow', 'zrw_sub_group_province.sub_grp_allow_id = zrw_sub_group_allow.sub_grp_allow_id', 'left')
                                    ->get();

        // print_r($this->zerowaste_db->last_query()); exit;  //view query
        return $query->num_rows();

    } //check_prov_duplicate



    //=========================== END Masterdata =====================//



    
}