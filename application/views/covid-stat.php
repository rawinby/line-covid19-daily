
<div class="container">
    <br>
    <br>
    <div class="row">
        <div class="col-md-12 text-center">
            <h2 class="font-weight-bold">ยอดผู้ติดเชื้อโควิด-19</h2>
            <h5>อัพเดทล่าสุด <?php echo DateThai($f['UpdateDate']) ?> น.</h5>
        </div>

    </div>

    <br>
    <br>
    <div class="row justify-content-center">
        <div class="col-lg-6">
                
            <div class="row justify-content-center">
                <div class="col-xs-6 ">

                    <div class="box box1">
                        <div class="title">ติดเชื้อ<?php echo ($f['NewConfirmed'] > 0 ? 'เพิ่มขึ้น' : 'ลดลง')?></div>
                        <div class="num"><?php echo number_format($f['NewConfirmed'])?></div>
                        <div class="sub_num">สะสม <?php echo number_format($f['Confirmed'])?></div>
                    </div>

                </div>
                <div class="col-xs-6 ">

                    <div class="box box2">
                        <div class="title">เสียชีวิต</div>
                        <div class="num"><?php echo number_format($f['Deaths'])?></div>
                        <div class="sub_num"><?php echo ($f['NewDeaths'] != 0 ? ($f['NewDeaths'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($f['NewDeaths'])) : 'คงที่ '.number_format($f['NewDeaths']))?></div>
                    </div>

                </div>
            </div>
            

            <div class="row justify-content-center">
                <div class="col-xs-6 ">

                    <div class="box box3">
                        <div class="title">รักษาตัว</div>
                        <div class="num"><?php echo number_format($f['Hospitalized'])?></div>
                        <div class="sub_num"><?php echo ($f['NewHospitalized'] != 0 ? ($f['NewHospitalized'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($f['NewHospitalized'])) : '-')?></div>
                    </div>

                </div>
                <div class="col-xs-6 ">

                    <div class="box box4">
                        <div class="title">หายแล้ว</div>
                        <div class="num"><?php echo number_format($f['Recovered'])?></div>
                        <div class="sub_num"><?php echo ($f['NewRecovered'] != 0 ? ($f['NewRecovered'] > 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') . str_replace('-','', number_format($f['NewRecovered'])) : '-')?></div>
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
            <div><a target="_blank" href="https://rawin.co">Dev by: Rawin.co</a></div>
        </div>

    </div>

    <br>
    <br>
</div>