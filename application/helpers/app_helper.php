<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function chg_date_en($date_input) { //use chg_date_en('06/05/2563 18:50:05'); 
    if(!empty($date_input)){
        $d = substr($date_input,0,10);
		$t = substr($date_input,11,8);
		$da = explode('/',$d);
		return $da[0].'-'.$da[1].'-'.($da[2] - 543).(!empty($t) ? ' '.$t : '');
    }else{
        return '-';
    }
}

function chg_date_th($date_input) { //use chg_date_th('2020-05-06 18:50:05'); 
    if(!empty($date_input)){
        $d = substr($date_input,0,10);
        $t = substr($date_input,11,8);
        $da = explode('-',$d);
        return $da[2].'/'.$da[1].'/'.($da[0] + 543).(!empty($t) ? ' '.$t : '');
    }else{
        return '-';
    }
}

function get_current_date() {
    return date('Y-m-d H:i:s');
}

function DateThai($strDate)
{
    $strYear = date("Y",strtotime($strDate))+543;
    $strMonth= date("n",strtotime($strDate));
    $strDay= date("j",strtotime($strDate));
    $strHour= date("H",strtotime($strDate));
    $strMinute= date("i",strtotime($strDate));
    $strSeconds= date("s",strtotime($strDate));
    $strMonthCut = Array("","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.");
    $strMonthThai=$strMonthCut[$strMonth];
    return "$strDay $strMonthThai ".substr($strYear,2,2)." $strHour:$strMinute";
}

function multiexplode($delimiters,$string) { //use $exploded = multiexplode(array(",",".","|",":","-"),'2015.25,26-18');
    $ready = str_replace($delimiters, $delimiters[0], $string);
    $launch = explode($delimiters[0], $ready);
    return $launch;
}

function curl_call($method='GET',$url,$form_param=array(),$header=array()) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $form_param);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
    $output = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return json_decode($output,true);
}



function get_session_login($f='') { //มาจาก One Account
    $ci =& get_instance();
    $user_login = $ci->session->userdata('user_login');
    $ul = '';
    if(!empty($user_login)){
        if(!empty($f)){
            $ul = $user_login[$f];
        }
        else{
            $ul = $user_login['user_id']; //get user_id
        }
    }
    return $ul;
    
    // return 594;
    /*
    **** อย่าลืมลบออก - โบว์ ****
    Table : zrw_admin_profile

    admin_role_code (สิทธิ์การใช้งาน)
        10 = Super Administrator
        20 = General Admin


    admin_level_code (ระดับการจัดการข้อมูล)
        10 = ระดับประเทศ
        20 = ระดับสำนักงานสิ่งแวดล้อม
        30 = ระดับจังหวัด

    
    ========================================================
    ref_admin_id        admin_role_code     admin_level_code
    ---------------------------------------------------------
    2	                10	                10
    594	                20	                10
    10654	            20	                20
    r10655	            20	                30

    
    */
}

function get_session_login_role($f='role_text') {
    $ci =& get_instance();
    $ci->load->model('backend/admin_model');

    $user_login = $ci->session->userdata('user_login');
    $user_login_role = $ci->session->userdata('user_login_role');
    $ro = '';
    if(!empty( $user_login )){
        if(!empty($user_login_role['role_text'])){
            $ro = $user_login_role[$f];
        }
        else{
            $ul = '';
            $res_ap = $ci->admin_model->get_admin_profile($user_login['user_id']);  
            if(!empty($res_ap)){
                if($res_ap['admin_role_code'] == '10'){ //admin_role_code 10=SuperAdmin
                    $ul = '<span>เข้าถึงข้อมูลได้ทุกจังหวัด</span>';
                }
                else{ //20=GeneralAdmin
                    if($res_ap['admin_level_code'] == '10'){
                        $ul = '<span>เข้าถึงข้อมูลได้ทุกจังหวัด</span>';
                    }
                    else if($res_ap['admin_level_code'] == '20'){
                        $res_aa = $ci->admin_model->get_admin_allow($user_login['user_id']);
                        $al = [];
                        foreach($res_aa as $val){
                            $al[] = '<span>'.$val['sub_grp_allow_name'].'</span>';
                        }
                        $ul = 'เข้าถึงข้อมูล:<br>'.implode('', $al);
                    }
                    else{ //30
                        $res_ar = $ci->admin_model->get_admin_province($user_login['user_id']);
                        $pr = [];
                        foreach($res_ar as $val){
                            $pr[] = $val['prov_name'];
                        }
                        $ul = 'เข้าถึงข้อมูล:<br>'.implode(' / ', $pr);
                    }
                }

                //---- Create Session ---
                $the_session['user_login_role'] = [
                    'role_text' => $ul,
                    'admin_role_code' => $res_ap['admin_role_code'], //10=SuperAdmin, 20=GeneralAdmin
                    'admin_level_code' => $res_ap['admin_level_code'] //10 20 30
                ];
                $ci->session->set_userdata($the_session);
                //---
                $user_login_role = $ci->session->userdata('user_login_role');
                $ro = $user_login_role[$f];
            }
            else{
                $ro = '';
            }
        }
    }
    return $ro;
}

function add_admin_log($func_code,$description,$admin_id,$admin_full_name) {
    $ci =& get_instance();
    $ci->load->model('backend/admin_model');
    return $ci->admin_model->add_admin_log($func_code,$description,$admin_id,$admin_full_name);
}


function chg_date_en_query($date_input) { //use chg_date_en('06/05/2563 18:50:05'); 
    if(!empty($date_input)){
        $d = substr($date_input,0,10);
		$t = substr($date_input,11,8);
		$da = explode('/',$d);
        return ($da[2] - 543).'-'.$da[1].'-'.($da[0]).(!empty($t) ? ' '.$t : '');
    }else{
        return '-';
    }
}

function isJson($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function fnc_writeFile($pathfile, $data) {
    $myFile = fopen($pathfile, 'w');
    fwrite($myFile, $data);
    fclose($myFile);
    return true;
}

function fnc_readFile($pathfile) {
    $myFile_txt = $pathfile;
    $myFile = fopen($myFile_txt, 'r');
    $myFile_r = fread($myFile, filesize($myFile_txt));
    fclose($myFile);
    return $myFile_r;
}
