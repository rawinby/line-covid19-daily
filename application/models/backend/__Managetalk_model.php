<?php

class Managetalk_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
        $this->mediaplan_db = $this->load->database('default',TRUE);
    }

    public function talk_list($data=array())
	{
        $wh = '';
        $sql = "SELECT 
                    ps.talk_id,
                    ps.plan_date,
                    MID(ps.starttime,1,10) AS program_date,
                    ps.media_type,
                    ps.channel,
                    ps.program_group,
                    ps.program_name,
                    mc.mc_name,
                    pr.presenter_name,
                    pf.professional_name,
                    ot.optional_name,
                    mf.mediafile_name,
                    pd.maincode AS item_code,
                    '' AS item_name,
                    pd.program_detail_id,
                    ps.agent
                FROM mediaplan_talk_promoteschedule_sap AS ps
                LEFT JOIN mediaplan_talk_programdetail_sap AS pd ON MID(ps.starttime,1,10) = pd.program_date 
                                                                AND ps.channel = pd.channel 
                                                                AND ps.program_group = pd.program_group 
                                                                AND ps.program_name = pd.program_name
                LEFT JOIN mediaplan_mc AS mc ON pd.mc_id = mc.mc_id
                LEFT JOIN mediaplan_presenter AS pr ON pd.presenter_id = pr.presenter_id
                LEFT JOIN mediaplan_professional AS pf ON pd.professional_id = pf.professional_id
                LEFT JOIN mediaplan_optional AS ot ON pd.optional_id = ot.optional_id
                LEFT JOIN mediaplan_mediafile AS mf ON pd.mediafile_id = mf.mediafile_id
                
                WHERE ps.active_status = 'A'
                      $wh
                ORDER BY ps.plan_date DESC, MID(ps.starttime,1,10) DESC, ps.media_type, ps.channel, ps.program_group, ps.program_name
        ";
        $query = $this->mediaplan_db->query($sql);
        return $query->result_array();
    }
    
    public function mc_lists()
	{
        $query = $this->mediaplan_db->select('*')
                                    ->from('mediaplan_mc')
                                    ->where('active_status','A')
                                    ->get();
        return $query->result_array();
    }
    
    public function presenter_lists()
	{
        $query = $this->mediaplan_db->select('*')
                                    ->from('mediaplan_presenter')
                                    ->where('active_status','A')
                                    ->get();
        return $query->result_array();
    }
    
    public function professional_lists()
	{
        $query = $this->mediaplan_db->select('*')
                                    ->from('mediaplan_professional')
                                    ->where('active_status','A')
                                    ->get();
        return $query->result_array();
    }
    
    public function optional_lists()
	{
        $query = $this->mediaplan_db->select('*')
                                    ->from('mediaplan_optional')
                                    ->where('active_status','A')
                                    ->get();
        return $query->result_array();
    }

    public function mediafile_lists()
	{
        $query = $this->mediaplan_db->select('*')
                                    ->from('mediaplan_mediafile')
                                    ->where('active_status','A')
                                    ->get();
        return $query->result_array();
    }

    public function checkMaping($data=array())
	{
        $query = $this->mediaplan_db->select('*')
                                    ->from('mediaplan_talk_programdetail_sap')
                                    ->where('plan_date',$data['plan_date'])
                                    ->where('program_date',$data['program_date'])
                                    ->where('media_type',$data['media_type'])
                                    ->where('channel',$data['channel'])
                                    ->where('program_group',$data['program_group'])
                                    ->where('program_name',$data['program_name']);
                                    // ->get();
        return $query->count_all_results();
        // return $this->mediaplan_db->last_query();
	}

    public function insertProgramDetail($data=array())
	{
        $this->mediaplan_db->insert('mediaplan_talk_programdetail_sap', $data);
        return $this->mediaplan_db->insert_id();
	}
    
    public function insertMapProgramItem($data=array())
	{
        return $this->mediaplan_db->insert_batch('mediaplan_talk_mapprogramitem_sap', $data);	
	}
    
}
