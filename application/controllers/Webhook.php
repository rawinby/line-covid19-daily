<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Webhook extends CI_Controller {

	public function __construct() {
		parent::__construct();
	}

	public function webhook_line_official()
	{	
		/*Get Data From POST Http Request*/
		$datas = file_get_contents('php://input');
		/*Decode Json From LINE Data Body*/
		$deCode = json_decode($datas,true);

		$replyToken = $deCode['events'][0]['replyToken'];
		$userId = $deCode['events'][0]['source']['userId'];
		$text = $deCode['events'][0]['message']['text'];
		$LINEDatas['token'] = "N4qo6GuAyT0cA7nT1eziR3LVWGKxdnP5enPFPSn/6y4zbLlkxVU4XPyaYDE2fMppFY++CeZV9cQdtcaUeDGRSEKGlA+h7uuF0ezw9uQd4MEyBRVjQFOS+tsKIrmPC8Vy9B1esE/KS7f/rmYD0/rPXQdB04t89/1O/w1cDnyilFU=";

		if($text === "สมัครรับการแจ้งยอดโควิด"){

			$LINEDatas['url'] = "https://api.line.me/v2/bot/message/reply";

			
			//--- API Get Profile ---
			$LINEDatasProfile['url'] = "https://api.line.me/v2/bot/profile/".$userId;
			$LINEDatasProfile['token'] = $LINEDatas['token'];
			$res_profile = json_decode(getData($LINEDatasProfile),true);
			//--- End API Get Profile ---

			$postField = [];
			$postField['replyToken'] = $replyToken;
			// $messages['messages'][0] = getFormatTextMessage($text." / ". $userId);
			// $postField['messages'][0] = getFormatTextMessage("โอเค! เราจะส่งการแจ้งเตือนให้คุณ ".$res_profile['displayName']." 😀 ".$userId);
			$postField['messages'][0] = getFormatTextMessage("โอเค! เราจะแจ้งยอดโควิดประจำวันให้คุณ ".$res_profile['displayName']." 😀 ");

			$results = postData(json_encode($postField),$LINEDatas);


			$query = $this->db->query("SELECT * FROM covid19_user_line WHERE user_id = '$userId' ");
			if($query->num_rows() === 0){
				$data = [
					'user_id' => $userId,
					'display_name' => $res_profile['displayName'],
					'picture_url' => $res_profile["pictureUrl"],
					'status_message' => $res_profile["statusMessage"],
					'status' => 1,
					'create_datetime' => date('Y-m-d H:i:s')
				];
				$this->db->insert('covid19_user_line',$data);
			}else{
				$this->db->update('covid19_user_line', [
					'user_id' => $userId,
					'display_name' => $res_profile['displayName'],
					'picture_url' => $res_profile["pictureUrl"],
					'status_message' => $res_profile["statusMessage"],
					'status' => 1,
					'update_datetime' => date('Y-m-d H:i:s')
				],
				['user_id' => $userId]);
			}

			var_dump($results);
		}
		else if($text === "ยกเลิกรับการแจ้งยอดโควิด"){

			$LINEDatas['url'] = "https://api.line.me/v2/bot/message/reply";
	
			//--- API Get Profile ---
			$LINEDatasProfile['url'] = "https://api.line.me/v2/bot/profile/".$userId;
			$LINEDatasProfile['token'] = $LINEDatas['token'];
			$res_profile = json_decode(getData($LINEDatasProfile),true);
			//--- End API Get Profile ---
	
			$postField = [];
			$postField['replyToken'] = $replyToken;
			// $messages['messages'][0] = getFormatTextMessage($text." / ". $userId);
			$postField['messages'][0] = getFormatTextMessage("ยกเลิกรับการแจ้งยอดโควิดให้คุณ ".$res_profile['displayName']." แล้ว");
	
			$results = postData(json_encode($postField),$LINEDatas);
	
			$this->db->update('covid19_user_line', [
				'status' => 0,
				'update_datetime' => date('Y-m-d H:i:s')
			],
			['user_id' => $userId]);

			var_dump($results);
	
		}
	}


	public function send_covid19()
	{	
		$getApi['url'] = 'https://covid19.th-stat.com/api/open/today';
		$getApi['token'] = "";
		$res_covid = json_decode(getData($getApi),true);	

		$ud_dt = explode(' ', $res_covid['UpdateDate']);
		$ud_d_en = substr($ud_dt[0],6,4).'-'.substr($ud_dt[0],3,2).'-'.substr($ud_dt[0],0,2);
		$ud_dt_en = substr($ud_dt[0],6,4).'-'.substr($ud_dt[0],3,2).'-'.substr($ud_dt[0],0,2).' '.$ud_dt[1];

		echo 'วันที่ปัจจุบัน: '.date('Y-m-d'); echo '<br>';		
		echo 'วันที่จาก Api: '.$ud_dt_en; echo '<br>';
		// exit;

		$force = (isset($_GET['force']) && $_GET['force']) ? $_GET['force'] : 0;
		if(date('Y-m-d') == $ud_d_en || $force == 1){

			$query = $this->db->query('SELECT * FROM covid19_stat WHERE DATE(UpdateDate) = "'. $ud_d_en .'" ');
			if($query->num_rows() > 0){
				echo 'มีข้อมูลแล้ว '. $ud_d_en;
				exit;
			}

			// 21/02/2021
			$query2 = $this->db->query('SELECT * FROM covid19_stat WHERE DATE(UpdateDate) = "'. $ud_d_en .'" ');
			if($query2->num_rows() == 0){ //ถ้ามีข้อมูลแล้ว
				$data_insert = [
					'NewConfirmed' => $res_covid['NewConfirmed'],
					'Confirmed' => $res_covid['Confirmed'],
					'Deaths' => $res_covid['Deaths'],
					'NewDeaths' => $res_covid['NewDeaths'],
					'Hospitalized' => $res_covid['Hospitalized'],
					'NewHospitalized' => $res_covid['NewHospitalized'],
					'Recovered' => $res_covid['Recovered'],
					'NewRecovered' => $res_covid['NewRecovered'],
					'UpdateDate' => $ud_dt_en,
					'create_datetime' => $ud_dt_en
				];
				$this->db->insert('covid19_stat',$data_insert);
			}


			$query3 = $this->db->query('SELECT user_id FROM covid19_user_line WHERE status = 1');
			$to_txt = "[";
			$n = 0;
			foreach($query3->result_array() as $row){
				if($n > 0){
					$to_txt .= ",";
				}
				$to_txt .= '"'.$row['user_id'].'"';
				$n++;
			}
			$to_txt .= "]";

			$json = '
			{
				"to": '. $to_txt .',
				"messages": [
					{
						"type": "flex",
						"altText": "ยอดผู้ติดเชื้อโควิด-19 วันที่ '. DateThai($ud_dt_en) .' น.",
						"contents": {
							"type": "bubble",
							"hero": {
								"type": "box",
								"layout": "vertical",
								"paddingTop": "25px",
								"contents": [
									{
										"type": "text",
										"text": "ยอดผู้ติดเชื้อโควิด-19",
										"size": "xl",
										"align": "center",
										"weight": "bold",
										"color": "#B12C3E"
									},
									{
										"type": "text",
										"text": "อัพเดทล่าสุด '. DateThai($ud_dt_en) .' น.",
										"color": "#111111",
										"weight": "bold",
										"align": "center",
										"size": "md"
									},
									{
										"type": "image",
										"url": "https://img.freepik.com/free-vector/covid-19-coronavirus-background-with-realistic-virus-cells_7714-692.jpg",
										"size": "full",
										"aspectRatio": "5:1",
										"aspectMode": "cover"
									}
								],
								"spacing": "10px"
							},
							"body": {
								"type": "box",
								"layout": "vertical",
								"spacing": "md",
								"contents": [
									{
										"type": "box",
										"layout": "horizontal",
										"spacing": "md",
										"contents": [
											{
												"type": "box",
												"layout": "vertical",
												"borderWidth": "medium",
												"backgroundColor": "#FFE098",
												"borderColor": "#FFE098",
												"paddingAll": "4px",
												"cornerRadius": "5px",
												"contents": [
													{
														"type": "text",
														"align": "center",
														"color": "#000000",
														"text": "ติดเชื้อ'. ($res_covid['NewConfirmed'] > 0 ? 'เพิ่มขึ้น' : 'ลดลง') .'"
													},
													{
														"type": "text",
														"align": "center",
														"weight": "bold",
														"color": "#000000",
														"size": "lg",
														"text": "'. number_format($res_covid['NewConfirmed']) .'"
													},
													{
														"type": "text",
														"align": "center",
														"size": "xs",
														"color": "#0000ff",
														"text": "สะสม '. number_format($res_covid['Confirmed']) .'"
													}
												]
											},
											{
												"type": "box",
												"layout": "vertical",
												"borderWidth": "medium",
												"backgroundColor": "#FF948D",
												"borderColor": "#FF948D",
												"paddingAll": "4px",
												"cornerRadius": "5px",
												"contents": [
													{
														"type": "text",
														"align": "center",
														"color": "#000000",
														"text": "เสียชีวิต"
													},
													{
														"type": "text",
														"align": "center",
														"weight": "bold",
														"color": "#000000",
														"size": "lg",
														"text": "'. number_format($res_covid['Deaths']) .'"
													},
													{
														"type": "text",
														"align": "center",
														"size": "xs",
														"color": "#0000ff",
														"text": "'. ($res_covid['NewDeaths'] != 0 ? ($res_covid['NewDeaths'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($res_covid['NewDeaths'])) : 'คงที่ '. number_format($res_covid['NewDeaths'])) .'"
													}
												]
											}
										]
									},
									{
										"type": "box",
										"layout": "horizontal",
										"spacing": "md",
										"contents": [
											{
												"type": "box",
												"layout": "vertical",
												"borderWidth": "medium",
												"backgroundColor": "#92DFFF",
												"borderColor": "#92DFFF",
												"paddingAll": "4px",
												"cornerRadius": "5px",
												"contents": [
													{
														"type": "text",
														"align": "center",
														"color": "#000000",
														"text": "รักษาตัว"
													},
													{
														"type": "text",
														"align": "center",
														"weight": "bold",
														"color": "#000000",
														"size": "lg",
														"text": "'. number_format($res_covid['Hospitalized']) .'"
													},
													{
														"type": "text",
														"align": "center",
														"size": "xs",
														"color": "#0000ff",
														"text": "'. ($res_covid['NewHospitalized'] != 0 ? ($res_covid['NewHospitalized'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($res_covid['NewHospitalized'])) : '-') .'"
													}
												]
											},
											{
												"type": "box",
												"layout": "vertical",
												"borderWidth": "medium",
												"backgroundColor": "#A3F2C6",
												"borderColor": "#A3F2C6",
												"paddingAll": "4px",
												"cornerRadius": "5px",
												"contents": [
													{
														"type": "text",
														"align": "center",
														"color": "#000000",
														"text": "หายแล้ว"
													},
													{
														"type": "text",
														"align": "center",
														"weight": "bold",
														"color": "#000000",
														"size": "lg",
														"text": "'. number_format($res_covid['Recovered']) .'"
													},
													{
														"type": "text",
														"align": "center",
														"size": "xs",
														"color": "#0000ff",
														"text": "'. ($res_covid['NewRecovered'] != 0 ? ($res_covid['NewRecovered'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($res_covid['NewRecovered'])) : '-') .'"
													}
												]
											}
										]
									}
								],
								"spacing": "10px"
							},
							"footer": {
								"type": "box",
								"layout": "vertical",
								"contents": [
									{
										"type": "button",
										"action": {
											"type": "uri",
											"label": "Dev by: Rawin.co",
											"uri": "https://rawin.co"
										},
										"style": "link",
										"color": "#999999"
									}
								]
							}
						}
					}
				]
			}
			

			';

			$postField = json_decode($json,true);
			// $postField['to'] = ['U268b9d1419e72dd4675d32f6baa326af'];
			// // $messages['messages'][0] = getFormatTextMessage($text." / ". $userId);
			// $postField['messages'][0] = getFormatTextMessage("โอเค! เราจะส่งการแจ้งเตือนให้คุณ 555 😀 ");
			
			$LINEDatas['url'] = "https://api.line.me/v2/bot/message/multicast";
			$LINEDatas['token'] = "N4qo6GuAyT0cA7nT1eziR3LVWGKxdnP5enPFPSn/6y4zbLlkxVU4XPyaYDE2fMppFY++CeZV9cQdtcaUeDGRSEKGlA+h7uuF0ezw9uQd4MEyBRVjQFOS+tsKIrmPC8Vy9B1esE/KS7f/rmYD0/rPXQdB04t89/1O/w1cDnyilFU=";

			$results = postData(json_encode($postField),$LINEDatas);

	
			var_dump($results);

		}else{
			echo 'ยังไม่มีข้อมูลล่าสุด';
		}

	}







}