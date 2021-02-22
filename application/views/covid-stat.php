
<div class="container">
    <br>
    <br>
    <div class="row">
        <div class="col-md-12 text-center">
            <h2 class="font-weight-bold">ยอดผู้ติดเชื้อโควิด-19</h2>
            <h5>อัพเดทล่าสุด <?php echo DateThai($update_date) ?></h5>
        </div>

    </div>

    <br>
    <br>
    <div class="row justify-content-center">
        <div class="col-lg-6">
                
            <div class="row justify-content-center">
                <div class="col-xs-6 ">

                    <div class="box box1">
                        <div class="title">ติดเชื้อ<?php echo ($res_covid['NewConfirmed'] > 0 ? 'เพิ่มขึ้น' : 'ลดลง')?></div>
                        <div class="num"><?php echo number_format($res_covid['NewConfirmed'])?></div>
                        <div class="sub_num">สะสม <?php echo number_format($res_covid['Confirmed'])?></div>
                    </div>

                </div>
                <div class="col-xs-6 ">

                    <div class="box box2">
                        <div class="title">เสียชีวิต</div>
                        <div class="num"><?php echo number_format($res_covid['Deaths'])?></div>
                        <div class="sub_num"><?php echo ($res_covid['NewDeaths'] != 0 ? ($res_covid['NewDeaths'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($res_covid['NewDeaths'])) : '-')?></div>
                    </div>

                </div>
            </div>
            

            <div class="row justify-content-center">
                <div class="col-xs-6 ">

                    <div class="box box3">
                        <div class="title">รักษาตัว</div>
                        <div class="num"><?php echo number_format($res_covid['Hospitalized'])?></div>
                        <div class="sub_num"><?php echo ($res_covid['NewHospitalized'] != 0 ? ($res_covid['NewHospitalized'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($res_covid['NewHospitalized'])) : '-')?></div>
                    </div>

                </div>
                <div class="col-xs-6 ">

                    <div class="box box4">
                        <div class="title">หายแล้ว</div>
                        <div class="num"><?php echo number_format($res_covid['Recovered'])?></div>
                        <div class="sub_num"><?php echo ($res_covid['NewRecovered'] != 0 ? ($res_covid['NewRecovered'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($res_covid['NewRecovered'])) : '-')?></div>
                    </div>

                </div>
                </div>
            </div>
            
        </div>
    </div>

    <br>
    <br>
    <div class="row">
        <div class="col-md-12 text-center">
            <div>ข้อมูลจาก: กรมควบคุมโรค</div>
            <div>Dev by: Rawin.co</div>
        </div>

    </div>

    <br>
    <br>
</div>