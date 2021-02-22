<?php

class Community_model extends CI_Model
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

    public function autocomplete($urban_year='',$prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($urban_year)){            
            $wh_yearly .= 'AND uy.urban_year = '.$urban_year;
        }
        else{
            $wh_yearly .= 'AND uy.urban_year = (SELECT MAX(urban_year) FROM zrw_urban_yearly WHERE urban_id = uy.urban_id)';
        }
        if(!empty($prov_code)){
            $this->zerowaste_db->or_where('ua.prov_code',$prov_code);
        }
        if(!empty($keyword)){
            $this->zerowaste_db->or_like('ua.area_name',$keyword);
        }
        $query = $this->zerowaste_db->select('
                                        ua.urban_id,
                                        ua.area_name
                                    ')
                                    ->from('zrw_urban_area AS ua')
                                    ->join('zrw_urban_yearly AS uy', 'ua.urban_id = uy.urban_id '. $wh_yearly, 'left')
                                    ->join('tbl_province AS pr', 'ua.prov_code = pr.prov_code', 'left')
                                    ->join('tbl_amphoe AS am', 'ua.amp_code = am.amp_code', 'left')
                                    ->join('tbl_tambon AS ta', 'ua.tam_code = ta.tam_code', 'left')
                                    ->get();
        return $query->result_array();
    }

    
    

    public function get_datamap_count($urban_year='', $sub_grp_allow_id='', $prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($urban_year)){            
            $wh_yearly .= 'AND uy.urban_year = '.$urban_year;
        }
        else{
            $wh_yearly .= 'AND uy.urban_year = (SELECT MAX(urban_year) FROM zrw_urban_yearly WHERE urban_id = uy.urban_id)';
        }

        if(!empty($keyword)){
            $this->zerowaste_db->like('ua.area_name',$keyword);
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
                ua.prov_code IN (
                    SELECT prov_code
                    FROM zrw_sub_group_province
                    WHERE 1=1 '.$wh_sp.'
                )
            ');
        }
        
        $query = $this->zerowaste_db->select("
                                    COUNT(ua.area_name) AS count_group_all,
                                    SUM(IIF(uy.urban_grp_code='L' AND ua.ref_center_id IS NULL,1,0)) AS count_group_l,
                                    SUM(IIF(uy.urban_grp_code='M' AND ua.ref_center_id IS NULL,1,0)) AS count_group_m,
                                    SUM(IIF(uy.urban_grp_code='S' AND ua.ref_center_id IS NULL,1,0)) AS count_group_s,
                                    SUM(IIF(ua.ref_center_id IS NOT NULL,1,0)) AS count_group_center,
                                    SUM(IIF(uy.urban_grp_code IS NULL,1,0)) AS count_group_null,
                                    MAX(ua.date_created) AS lastdate
                                ")
                                ->from('zrw_urban_area AS ua')
                                ->join('zrw_urban_yearly AS uy', 'ua.urban_id = uy.urban_id '. $wh_yearly, 'left');
                                    
        $query = $this->zerowaste_db->get();
        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()); exit;
        return $query->row_array();
    }


    public function get_datamap_graph($urban_year='', $sub_grp_allow_id='', $prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($urban_year)){            
            $wh_yearly .= "AND uy.urban_year = '".$urban_year."' ";
        }
        else{
            $wh_yearly .= "AND uy.urban_year = (SELECT MAX(urban_year) FROM zrw_urban_yearly WHERE urban_id = uy.urban_id)";
        }

        if(!empty($keyword)){
            $this->zerowaste_db->like('ua.area_name',$keyword);
        }

        if(!empty($sub_grp_allow_id) || !empty($prov_code)){
            if(!empty($sub_grp_allow_id)){
                $this->zerowaste_db->where("sga.sub_grp_allow_id = '". $sub_grp_allow_id ."' ");
            }
            if(!empty($prov_code)){
                $this->zerowaste_db->where("ua.prov_code = '". $prov_code ."' ");
            }
        }
        
        $this->zerowaste_db->where("sga.sub_grp_allow_id IS NOT NULL");
        $query = $this->zerowaste_db->select("
                                    sga.sub_grp_allow_id,
                                    sga.sub_grp_allow_abbr,
                                    COUNT(ua.area_name) AS count_d
                                ")
                                ->from('zrw_urban_area AS ua')
                                ->join('zrw_urban_yearly AS uy', 'ua.urban_id = uy.urban_id '. $wh_yearly, 'left')
                                ->join('zrw_sub_group_province AS sgp', 'ua.prov_code = sgp.prov_code', 'left')
                                ->join('zrw_sub_group_allow AS sga', 'sgp.sub_grp_allow_id = sga.sub_grp_allow_id', 'left')
                                ->group_by('sga.sub_grp_allow_id, sga.sub_grp_allow_abbr');
                                    
        $query = $this->zerowaste_db->get();
        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()); exit;
        return $query->result_array();
    }



    public function get_datamap_table($urban_year='', $sub_grp_allow_id='', $prov_code='',$keyword='')
	{
        $wh_yearly = '';
        if(!empty($urban_year)){            
            $wh_yearly .= 'AND uy.urban_year = '.$urban_year;
        }
        else{
            $wh_yearly .= 'AND uy.urban_year = (SELECT MAX(urban_year) FROM zrw_urban_yearly WHERE urban_id = uy.urban_id)';
        }

        if(!empty($keyword)){
            $this->zerowaste_db->like('ua.area_name',$keyword);
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
                ua.prov_code IN (
                    SELECT prov_code
                    FROM zrw_sub_group_province
                    WHERE 1=1 '.$wh_sp.'
                )
            ');
        }
        
        $query = $this->zerowaste_db->select("
                                        ISNULL(ua.urban_id,'') AS urban_id, 
                                        ISNULL(ua.area_name,'') AS area_name, 
                                        ISNULL(ua.latitude,'') AS latitude, 
                                        ISNULL(ua.longitude,'') AS longitude, 
                                        ISNULL(ua.cover_name,'') AS cover_name, 
                                        ISNULL(uy.urban_grp_code,'') AS urban_grp_code, 
                                        ISNULL(ua.ref_center_id,'') AS ref_center_id,
                                        ISNULL(uy.urban_year,'') AS urban_year,
                                        ISNULL(pr.prov_name,'') AS prov_name,  
                                        ISNULL(ua.amp_code,'') AS amp_code, 
                                        ISNULL(ua.tam_code,'') AS tam_code, 
                                        ISNULL(am.amp_name,'') AS amp_name, 
                                        ISNULL(ta.tam_name,'') AS tam_name
                                ")
                                ->from('zrw_urban_area AS ua')
                                ->join('zrw_urban_yearly AS uy', 'ua.urban_id = uy.urban_id '. $wh_yearly, 'left')
                                ->join('tbl_province AS pr', 'ua.prov_code = pr.prov_code', 'left')
                                ->join('tbl_amphoe AS am', 'ua.amp_code = am.amp_code', 'left')
                                ->join('tbl_tambon AS ta', 'ua.tam_code = ta.tam_code', 'left')
                                ->group_by('
                                    ua.urban_id, 
                                    ua.area_name, 
                                    ua.latitude, 
                                    ua.longitude, 
                                    ua.cover_name, 
                                    uy.urban_grp_code, 
                                    ua.ref_center_id,
                                    uy.urban_year,
                                    pr.prov_name,  
                                    ua.amp_code, 
                                    ua.tam_code, 
                                    am.amp_name, 
                                    ta.tam_name
                                ')
                                ->order_by('ua.area_name','ASC');
                                    
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
                                                MAX(ua.date_created) AS date_last
                                                ');
        }else{
            $query = $this->zerowaste_db->select('pr.prov_name,
                                                  COUNT(ua.area_name) AS count_d
                                                ');
        }
        $query = $this->zerowaste_db->from('zrw_urban_area AS ua')
                                    ->join('zrw_sub_group_province AS sgp', 'ua.prov_code = sgp.prov_code', 'inner')
                                    ->join('zrw_sub_group_allow AS sga', 'sgp.sub_grp_allow_id = sga.sub_grp_allow_id', 'inner')
                                    ->join('tbl_province AS pr', 'ua.prov_code = pr.prov_code', 'inner');
                                    
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


    public function get_year($urban_id='')
	{ 
        if(!empty($urban_id)){
            $this->zerowaste_db->where('urban_id',$urban_id);
        }
        $query = $this->zerowaste_db->select('
                                        urban_year
                                    ')
                                    ->from('zrw_urban_yearly')
                                    ->order_by('urban_year','DESC')
                                    ->group_by('urban_year')
                                    ->get();
        return $query->result_array();
    }

    public function get_yearly($urban_id='', $year)
	{ 
        if(!empty($urban_id)){
            $this->zerowaste_db->where('ua.urban_id',$urban_id);
        }
        if(!empty($year)){
            $this->zerowaste_db->where('uy.urban_year',$year);
        }
        
        $query = $this->zerowaste_db->select("
                                        ISNULL(ua.urban_id,'') AS urban_id,
                                        ISNULL(uy.urban_year_id,'') AS urban_year_id,
                                        ISNULL(uy.urban_year,'') AS urban_year,
                                        ISNULL(ua.address,'') AS address,
                                        ISNULL(ua.moo,'') AS moo,
                                        ISNULL(ta.tam_name,'') AS tam_name,
                                        ISNULL(am.amp_name,'') AS amp_name,
                                        ISNULL(pr.prov_name,'') AS prov_name,
                                        ISNULL(ua.zip_code,'') AS zip_code,
                                        ISNULL(uy.contact_full_name,'') AS contact_full_name,
                                        ISNULL(uy.area_rai,'') AS area_rai,
                                        ISNULL(uy.population_num,'') AS population_num,
                                        ISNULL(uy.household_num,'') AS household_num,

                                        ISNULL(uy.solid_waste,'') AS solid_waste,
                                        ISNULL(uy.general_waste,'') AS general_waste,
                                        ISNULL(uy.organic_waste,'') AS organic_waste,
                                        ISNULL(uy.recycle_waste,'') AS recycle_waste,
                                        ISNULL(uy.hazardous_waste,'') AS hazardous_waste,
                                        
                                        ISNULL(uy.gov_name,'') AS gov_name,
                                        ISNULL(uy.gov_address,'') AS gov_address,
                                        ISNULL(ta2.tam_name,'') AS gov_tam_name,
                                        ISNULL(am2.amp_name,'') AS gov_amp_name,
                                        ISNULL(pr2.prov_name,'') AS gov_prov_name,

                                        ISNULL(uy.gov_phone,'') AS gov_phone,
                                        ISNULL(uy.gov_fax,'') AS gov_fax,
                                        ISNULL(uy.exec_full_name,'') AS exec_full_name,
                                        ISNULL(uy.exec_phone,'') AS exec_phone,
                                        ISNULL(uy.exec_position,'') AS exec_position,
                                        ISNULL(uy.officer_full_name,'') AS officer_full_name,
                                        ISNULL(uy.officer_phone,'') AS officer_phone,
                                        ISNULL(uy.officer_position,'') AS officer_position
                                    ")
                                    ->from('zrw_urban_area AS ua')
                                    ->join('zrw_urban_yearly AS uy', 'ua.urban_id = uy.urban_id', 'left')
                                    ->join('tbl_province AS pr', 'ua.prov_code = pr.prov_code', 'left')
                                    ->join('tbl_amphoe AS am', 'ua.amp_code = am.amp_code', 'left')
                                    ->join('tbl_tambon AS ta', 'ua.tam_code = ta.tam_code', 'left')

                                    ->join('tbl_province AS pr2', 'uy.gov_prov_code = pr2.prov_code', 'left')
                                    ->join('tbl_amphoe AS am2', 'uy.gov_amp_code = am2.amp_code', 'left')
                                    ->join('tbl_tambon AS ta2', 'uy.gov_tam_code = ta2.tam_code', 'left')
                                    ->get();

        // echo '<pre>'.str_replace('"','',$this->zerowaste_db->last_query()).'</pre>'; exit;
        return $query->row_array();
    }

}