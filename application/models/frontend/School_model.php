<?php

class School_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->zerowaste_db = $this->load->database('default',TRUE);
    }
    
    public function get_office()
	{    
        $query = $this->zerowaste_db->select('sub_grp_allow_id, sub_grp_allow_name')
                                    ->from('zrw_sub_group_allow')
                                    ->order_by('sub_grp_allow_id','ASC')
                                    ->get();
        return $query->result_array();
    }

    public function get_province($sub_grp_allow_id='')
	{
        if(!empty($sub_grp_allow_id)){
            $this->zerowaste_db->where('zrw_sub_group_province.sub_grp_allow_id',$sub_grp_allow_id);
        }
        $query = $this->zerowaste_db->select('zrw_sub_group_province.sub_grp_allow_id, tbl_province.prov_code, tbl_province.prov_name')
                                    ->from('tbl_province')
                                    ->join('zrw_sub_group_province', 'tbl_province.prov_code = zrw_sub_group_province.prov_code', 'left')
                                    ->order_by('tbl_province.prov_name','ASC')
                                    ->get();
        return $query->result_array();
    }

    public function autocomplete($school_year='',$prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($school_year)){            
            $wh_yearly .= 'AND sy.school_year = '.$school_year;
        }
        else{
            $wh_yearly .= 'AND sy.school_year = (SELECT MAX(school_year) FROM zrw_school_yearly WHERE school_id = sy.school_id)';
        }
        if(!empty($prov_code)){
            $this->zerowaste_db->or_where('sa.prov_code',$prov_code);
        }
        if(!empty($keyword)){
            $this->zerowaste_db->or_like('sa.area_name',$keyword);
        }
        $query = $this->zerowaste_db->select('
                                        sa.school_id,
                                        sa.area_name
                                    ')
                                    ->from('zrw_school_area AS sa')
                                    ->join('zrw_school_yearly AS sy', 'sa.school_id = sy.school_id '. $wh_yearly, 'left')
                                    ->join('tbl_province AS pr', 'sa.prov_code = pr.prov_code', 'left')
                                    ->join('tbl_amphoe AS am', 'sa.amp_code = am.amp_code', 'left')
                                    ->join('tbl_tambon AS ta', 'sa.tam_code = ta.tam_code', 'left')
                                    ->get();
        return $query->result_array();
    }



    public function get_datamap_count($school_year='', $sub_grp_allow_id='', $prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($school_year)){            
            $wh_yearly .= 'AND sy.school_year = '.$school_year;
        }
        else{
            $wh_yearly .= 'AND sy.school_year = (SELECT MAX(school_year) FROM zrw_school_yearly WHERE school_id = sy.school_id)';
        }

        if(!empty($keyword)){
            $this->zerowaste_db->like('sa.area_name',$keyword);
        }

        if(!empty($sub_grp_allow_id) || !empty($prov_code)){
            $wh_sp = '';
            if(!empty($sub_grp_allow_id)){
                $wh_sp .= "AND sub_grp_allow_id = '". $sub_grp_allow_id ."' ";
            }
            if(!empty($prov_code)){
                $wh_sp .= "AND prov_code = '". $prov_code ."' ";
            }
            $this->zerowaste_db->where('
                sa.prov_code IN (
                    SELECT prov_code
                    FROM zrw_sub_group_province
                    WHERE 1=1 '.$wh_sp.'
                )
            ');
        }
        
        $query = $this->zerowaste_db->select("
                                    COUNT(sa.area_name) AS count_group_all,
                                    SUM(IIF(sy.school_grp_code='A' AND sa.ref_center_id IS NULL,1,0)) AS count_group_a,
                                    SUM(IIF(sy.school_grp_code='B' AND sa.ref_center_id IS NULL,1,0)) AS count_group_b,
                                    SUM(IIF(sa.ref_center_id IS NOT NULL,1,0)) AS count_group_center,
                                    SUM(IIF(sy.school_grp_code IS NULL,1,0)) AS count_group_null,
                                    MAX(sa.date_created) AS lastdate
                                ")
                                ->from('zrw_school_area AS sa')
                                ->join('zrw_school_yearly AS sy', 'sa.school_id = sy.school_id '. $wh_yearly, 'left');
                                    
        $query = $this->zerowaste_db->get();
        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()); exit;
        return $query->row_array();
    }


    public function get_datamap_graph($school_year='', $sub_grp_allow_id='', $prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($school_year)){            
            $wh_yearly .= "AND sy.school_year = '".$school_year."' ";
        }
        else{
            $wh_yearly .= "AND sy.school_year = (SELECT MAX(school_year) FROM zrw_school_yearly WHERE school_id = sy.school_id)";
        }

        if(!empty($keyword)){
            $this->zerowaste_db->like('sa.area_name',$keyword);
        }

        if(!empty($sub_grp_allow_id) || !empty($prov_code)){
            if(!empty($sub_grp_allow_id)){
                $this->zerowaste_db->where("sga.sub_grp_allow_id = '". $sub_grp_allow_id ."' ");
            }
            if(!empty($prov_code)){
                $this->zerowaste_db->where("sa.prov_code = '". $prov_code ."' ");
            }
        }
        
        $this->zerowaste_db->where("sga.sub_grp_allow_id IS NOT NULL");
        $query = $this->zerowaste_db->select("
                                    sga.sub_grp_allow_id,
                                    sga.sub_grp_allow_abbr,
                                    COUNT(sa.area_name) AS count_d
                                ")
                                ->from('zrw_school_area AS sa')
                                ->join('zrw_school_yearly AS sy', 'sa.school_id = sy.school_id '. $wh_yearly, 'left')
                                ->join('zrw_sub_group_province AS sgp', 'sa.prov_code = sgp.prov_code', 'left')
                                ->join('zrw_sub_group_allow AS sga', 'sgp.sub_grp_allow_id = sga.sub_grp_allow_id', 'left')
                                ->group_by('sga.sub_grp_allow_id, sga.sub_grp_allow_abbr');
                                    
        $query = $this->zerowaste_db->get();
        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()); exit;
        return $query->result_array();
    }



    public function get_datamap_table($school_year='', $sub_grp_allow_id='', $prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($school_year)){            
            $wh_yearly .= 'AND sy.school_year = '.$school_year;
        }
        else{
            $wh_yearly .= 'AND sy.school_year = (SELECT MAX(school_year) FROM zrw_school_yearly WHERE school_id = sy.school_id)';
        }

        if(!empty($keyword)){
            $this->zerowaste_db->like('sa.area_name',$keyword);
        }

        if(!empty($sub_grp_allow_id) || !empty($prov_code)){
            $wh_sp = '';
            if(!empty($sub_grp_allow_id)){
                $wh_sp .= "AND sub_grp_allow_id = '". $sub_grp_allow_id ."' ";
            }
            if(!empty($prov_code)){
                $wh_sp .= "AND prov_code = '". $prov_code ."' ";
            }
            $this->zerowaste_db->where('
                sa.prov_code IN (
                    SELECT prov_code
                    FROM zrw_sub_group_province
                    WHERE 1=1 '.$wh_sp.'
                )
            ');
        }
        
        $query = $this->zerowaste_db->select("
                                        ISNULL(sa.school_id,'') AS school_id, 
                                        ISNULL(sa.area_name,'') AS area_name, 
                                        ISNULL(sa.latitude,'') AS latitude, 
                                        ISNULL(sa.longitude,'') AS longitude, 
                                        ISNULL(sa.cover_name,'') AS cover_name, 
                                        ISNULL(sy.school_grp_code,'') AS school_grp_code, 
                                        ISNULL(sa.ref_center_id,'') AS ref_center_id,
                                        ISNULL(sy.school_year,'') AS school_year,
                                        ISNULL(pr.prov_name,'') AS prov_name,  
                                        ISNULL(sa.amp_code,'') AS amp_code, 
                                        ISNULL(sa.tam_code,'') AS tam_code, 
                                        ISNULL(am.amp_name,'') AS amp_name, 
                                        ISNULL(ta.tam_name,'') AS tam_name
                                ")
                                ->from('zrw_school_area AS sa')
                                ->join('zrw_school_yearly AS sy', 'sa.school_id = sy.school_id '. $wh_yearly, 'left')
                                ->join('tbl_province AS pr', 'sa.prov_code = pr.prov_code', 'left')
                                ->join('tbl_amphoe AS am', 'sa.amp_code = am.amp_code', 'left')
                                ->join('tbl_tambon AS ta', 'sa.tam_code = ta.tam_code', 'left')
                                ->group_by('
                                    sa.school_id, 
                                    sa.area_name, 
                                    sa.latitude, 
                                    sa.longitude, 
                                    sa.cover_name, 
                                    sy.school_grp_code, 
                                    sa.ref_center_id,
                                    sy.school_year,
                                    pr.prov_name,  
                                    sa.amp_code, 
                                    sa.tam_code, 
                                    am.amp_name, 
                                    ta.tam_name
                                ')
                                ->order_by('sa.area_name','ASC');
                                    
        $query = $this->zerowaste_db->get();
        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()); exit;
        return $query->result_array();    
    }

    public function get_datagraph_detail($type='',$sub_grp_allow_id='')
	{
        if(!empty($sub_grp_allow_id)){
            $this->zerowaste_db->where('sga.sub_grp_allow_id', $sub_grp_allow_id);
        }
        if($type == 'row'){
            $query = $this->zerowaste_db->select('sga.sub_grp_allow_name,
                                                MAX(sa.date_created) AS date_last
                                                ');
        }else{
            $query = $this->zerowaste_db->select('pr.prov_name,
                                                  COUNT(sa.area_name) AS count_d
                                                ');
        }
        $query = $this->zerowaste_db->from('zrw_school_area AS sa')
                                    ->join('zrw_sub_group_province AS sgp', 'sa.prov_code = sgp.prov_code', 'inner')
                                    ->join('zrw_sub_group_allow AS sga', 'sgp.sub_grp_allow_id = sga.sub_grp_allow_id', 'inner')
                                    ->join('tbl_province AS pr', 'sa.prov_code = pr.prov_code', 'inner');
                                    
        if($type == 'row'){
            $this->zerowaste_db->group_by('sga.sub_grp_allow_name');
            $query = $this->zerowaste_db->get();
            // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()).'</pre>'; exit;
            return $query->row_array();
        }
        else{
            $this->zerowaste_db->group_by('pr.prov_name');
            $this->zerowaste_db->order_by('pr.prov_name','ASC');
            $query = $this->zerowaste_db->get();
            // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()).'</pre>'; exit;
            return $query->result_array();
        }
    }

    public function get_year($school_id='')
	{ 
        if(!empty($school_id)){
            $this->zerowaste_db->where('school_id',$school_id);
        }
        $query = $this->zerowaste_db->select('
                                        school_year
                                    ')
                                    ->from('zrw_school_yearly')
                                    ->order_by('school_year','DESC')
                                    ->group_by('school_year')
                                    ->get();
        return $query->result_array();
    }

    public function get_yearly($school_id='', $year)
	{ 
        if(!empty($school_id)){
            $this->zerowaste_db->where('sa.school_id',$school_id);
        }
        if(!empty($year)){
            $this->zerowaste_db->where('sy.school_year',$year);
        }
        
        $query = $this->zerowaste_db->select("
                                        ISNULL(sy.school_year_id,'') AS school_year_id,
                                        ISNULL(sy.school_year,'') AS school_year,
                                        ISNULL(sy.section_name,'') AS section_name,
                                        ISNULL(sa.address,'') AS address,
                                        ISNULL(sa.moo,'') AS moo,
                                        ISNULL(ta.tam_name,'') AS tam_name,
                                        ISNULL(am.amp_name,'') AS amp_name,
                                        ISNULL(pr.prov_name,'') AS prov_name,
                                        ISNULL(sa.zip_code,'') AS zip_code,
                                        ISNULL(sy.director_full_name,'') AS director_full_name,
                                        ISNULL(sy.director_phone,'') AS director_phone,
                                        ISNULL(sy.teacher_full_name,'') AS teacher_full_name,
                                        ISNULL(sy.teacher_phone,'') AS teacher_phone,
                                        ISNULL(sy.class_desc,'') AS class_desc,
                                        ISNULL(sy.student_num,'') AS student_num,
                                        ISNULL(sy.officer_num,'') AS officer_num,
                                        ISNULL(sy.yearly_desc,'') AS yearly_desc
                                    ")
                                    ->from('zrw_school_area AS sa')
                                    ->join('zrw_school_yearly AS sy', 'sa.school_id = sy.school_id', 'left')
                                    ->join('tbl_province AS pr', 'sa.prov_code = pr.prov_code', 'left')
                                    ->join('tbl_amphoe AS am', 'sa.amp_code = am.amp_code', 'left')
                                    ->join('tbl_tambon AS ta', 'sa.tam_code = ta.tam_code', 'left')
                                    ->get();

        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()).'</pre>'; exit;
        return $query->row_array();
    }

}