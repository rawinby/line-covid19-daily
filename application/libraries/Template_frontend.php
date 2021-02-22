<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Template_frontend
{
    var $ci;
    function __construct()
    {
        $this->ci =& get_instance();
    }
    
    function view($body_view='', $data=array(), $html=false)
    {
        $body_data = array();
        $body_data['page_title'] = (isset($data['page_title']) ? $data['page_title'].' | ' : '') .$this->ci->config->item('system_title');
        $body_data['body'] = !empty($body_view) ? $this->ci->load->view($body_view, $data, TRUE) : '';
        $body_data['body_class'] = !empty($data['body_class']) ? $data['body_class'] : '';
        $body_data['fetch_class'] = $this->ci->router->fetch_class();
        $body_data['fetch_method'] = $this->ci->router->fetch_method();
        // //---
        if($html == true){
            $t = '';
            $t .= $this->ci->load->view('themes/header', $body_data);
            $t .= $this->ci->load->view('themes/content', $body_data);
            $t .= $this->ci->load->view('themes/footer', $body_data);
            echo $t1;
        }else{
            $this->ci->load->view('themes/header', $body_data);
            $this->ci->load->view('themes/content', $body_data);
            $this->ci->load->view('themes/footer', $body_data);
        }
    }
}