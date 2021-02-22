function block(id, msg) {
  var _msg = !msg ? "Loading..." : msg
  var _inblock = "inblock"
  if (id == "body" || id == "" || id == undefined) {
    //ถ้าไม่ได้ใส่ชื่อ ID ให้แสดง block คลุมทั้งหน้า
    id = "body"
    _inblock = ""
  }
  $(id).css("position", "relative")
  $(id).children("#preload").remove()
  var ele_loading = '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
  $(id).append('<div id="preload" class="preload ' + _inblock + ' "><div class="pl-center">' + ele_loading + ' <div class="pl-msg"> ' + _msg + "</div></div>")
}

function unblock(id) {
  if (id == "body" || id == "" || id == undefined) {
    id = "body"
  }
  $(id).css("position", "")
  $(id).children("#preload").remove()
}

function block_small(id, msg) {
  $(id).css("position", "relative")
  $(id).children("#preload").remove()
  $(id).hide()

  var ele_loading = '<img src="' + base_url + 'assets/images/ajax-loader.gif">'
  $('<div id="preload-small" class="preload-small"><div class="form-control pl-small">' + ele_loading + "</div>").insertAfter($(id))
}

function unblock_small(id) {
  $(id).next("#preload-small").remove()
  $(id).show()
}

function block_button(id) {
  var ele_loading = '<img src="' + base_url + 'assets/images/ajax-loader.gif">'
  $(id).html(ele_loading).attr("disabled", true)
}

function unblock_button(id, txt) {
  if (!txt) {
    txt = "ตกลง"
  }
  $(id).html(txt).removeAttr("disabled")
}

function block_righttop(id, msg) {
  console.log("block_righttop: ", id)
  var _msg = !msg ? "Loading..." : msg
  var _inblock = "inblock"
  if (id == "body" || id == "" || id == undefined) {
    //ถ้าไม่ได้ใส่ชื่อ ID ให้แสดง block คลุมทั้งหน้า
    id = "body"
    _inblock = ""
  }
  $(id).css("position", "relative")
  $(id).children("#preload").remove()
  var ele_loading = '<img width="50" src="' + base_url + 'assets/images/loading2.gif">'
  $(id).append('<div id="preload" class="preload2 ' + _inblock + ' ">' + ele_loading + "</div>")
}
function unblock_righttop(id) {
  if (id == "body" || id == "" || id == undefined) {
    id = "body"
  }
  $(id).css("position", "")
  $(id).children("#preload").remove()
}

function alert_success(message, callback) {
  alert({ title: "", text: message, icon: "success" }, function () {
    if (callback) {
      return callback(true)
    }
  })
}

function alert_error(message, callback) {
  alert({ title: "", text: message, icon: "error" }, function () {
    if (callback) {
      return callback(true)
    }
  })
}

window.alert = function (message, callback) {
  // ex. object {'text': data.msg,'icon': 'success'}
  // ex. object {'title': 'เกิดข้อผิดพลาด','text': 'กรุณากรอก xxx','icon': 'error'}
  unblock()
  var _title = "",
    _text = "",
    _icon = "",
    _btnok = "ตกลง"
  if (typeof message === "object") {
    _title = message.title ? message.title : ""
    _text = message.text
    _icon = message.icon
    _btnok = message.btnok ? message.btnok : _btnok
  } else {
    _title = ""
    _text = message
    _icon = "warning" //warning,error,success
  }
  Swal.fire({
    title: _title,
    html: _text,
    icon: _icon,
    confirmButtonText: _btnok,
    allowEscapeKey: false,
    allowOutsideClick: false,
    allowEnterKey: false,
    confirmButtonColor: "#007bff",
  }).then(function (willOK) {
    if (willOK && callback) {
      return callback(true)
    }
  })
}

window.confirm = function (message, callback) {
  var _title = "",
    _text = "",
    _icon = "",
    _btnok = "ตกลง",
    _btncancel = "ยกเลิก"
  if (typeof message === "object") {
    _title = message.title ? message.title : ""
    _text = message.text
    _icon = message.icon ? message.icon : "info"
    _btnok = message.btnok ? message.btnok : _btnok
    _btncancel = message.btncancel ? message.btncancel : _btncancel
  } else {
    _title = "ยืนยัน"
    _text = message
    _icon = "question"
  }
  Swal.fire({
    title: _title,
    html: _text,
    icon: _icon,
    showCancelButton: true,
    confirmButtonColor: "#007bff",
    cancelButtonColor: "#6c757d",
    confirmButtonText: _btnok,
    cancelButtonText: _btncancel,
  }).then(function (isConfirm) {
    // console.info('confirm', isConfirm);
    if (isConfirm.value == true) {
      if (callback) {
        callback(true)
      }
    } else {
      if (isConfirm.dismiss == "cancel") {
        if (callback) {
          callback(false)
        }
      }
    }
  })
}

function pad(value, length) {
  //Add Zero Prevent
  return value.toString().length < length ? pad("0" + value, length) : value
}

function get_date_en() {
  var currentDate = new Date()
  var day = currentDate.getDate()
  var month = currentDate.getMonth() + 1
  var year = currentDate.getFullYear()
  return year + "-" + pad(month, 2) + "-" + pad(day, 2)
}

function get_date_th() {
  var currentDate = new Date()
  var day = currentDate.getDate()
  var month = currentDate.getMonth() + 1
  var year = currentDate.getFullYear() + 543
  return day + "/" + pad(month, 2) + "/" + pad(year, 2)
}

function chg_date_en(dd) {
  //date English = 31/12/2557 --> 2014-12-31
  if (dd) {
    var date = dd
    var date_array = date.split("/")
    var year = parseInt(date_array[2]) - 543
    var month = date_array[1]
    var day = date_array[0]
    return year + "-" + month + "-" + day
  } else {
    return ""
  }
}

function chg_date_th(dd) {
  //date English = 2014-12-31 --> 31/12/2557
  if (dd) {
    var date = dd.substr(0, 10)
    var date_array = date.split("-")
    var year = parseInt(date_array[0]) + 543
    var month = date_array[1]
    var day = date_array[2]
    return day + "/" + month + "/" + year
  } else {
    return ""
  }
}

function chg_datetime_th(dd) {
  //date English = 2014-12-31 22:25:30 --> 31/12/2557 22:25
  if (dd) {
    var dd = dd.split(" ")
    var date = dd[0]
    var date_array = date.split("-")
    var year = parseInt(date_array[0]) + 543
    var month = date_array[1]
    var day = date_array[2]

    var time = dd[1].substr(0, 5)
    return day + "/" + month + "/" + year + " " + time
  } else {
    return ""
  }
}

function number_format(number, decimals, dec_point, thousands_sep) {
  // http://kevin.vanzonneveld.net
  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     bugfix by: Michael White (http://getsprink.com)
  // +     bugfix by: Benjamin Lupton
  // +     bugfix by: Allan Jensen (http://www.winternet.no)
  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +     bugfix by: Howard Yeend
  // +    revised by: Luke Smith (http://lucassmith.name)
  // +     bugfix by: Diogo Resende
  // +     bugfix by: Rival
  // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
  // +   improved by: davook
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Jay Klehr
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Amir Habibi (http://www.residence-mixte.com/)
  // +     bugfix by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Theriault
  // +   improved by: Drew Noakes
  // *     example 1: number_format(1234.56);
  // *     returns 1: '1,235'
  // *     example 2: number_format(1234.56, 2, ',', ' ');
  // *     returns 2: '1 234,56'
  // *     example 3: number_format(1234.5678, 2, '.', '');
  // *     returns 3: '1234.57'
  // *     example 4: number_format(67, 2, ',', '.');
  // *     returns 4: '67,00'
  // *     example 5: number_format(1000);
  // *     returns 5: '1,000'
  // *     example 6: number_format(67.311, 2);
  // *     returns 6: '67.31'
  // *     example 7: number_format(1000.55, 1);
  // *     returns 7: '1,000.6'
  // *     example 8: number_format(67000, 5, ',', '.');
  // *     returns 8: '67.000,00000'
  // *     example 9: number_format(0.9, 0);
  // *     returns 9: '1'
  // *    example 10: number_format('1.20', 2);
  // *    returns 10: '1.20'
  // *    example 11: number_format('1.20', 4);
  // *    returns 11: '1.2000'
  // *    example 12: number_format('1.2000', 3);
  // *    returns 12: '1.200'
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
    dec = typeof dec_point === "undefined" ? "." : dec_point,
    toFixedFix = function (n, prec) {
      // Fix for IE parseFloat(0.55).toFixed(0) = 0;
      var k = Math.pow(10, prec)
      return Math.round(n * k) / k
    },
    s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split(".")
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || ""
    s[1] += new Array(prec - s[1].length + 1).join("0")
  }
  return s.join(dec)
}

function getRandomColor() {
  var letters = "0123456789ABCDEF".split("")
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 10)]
  }
  return color
}

// ====================Export Xls====================
var tableToExcel = (function () {
  //tableToExcel(table, tab_name, dl_name, font_size, font_family);
  var uri = "data:application/vnd.ms-excel;base64,",
    base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)))
    },
    format = function (s, c) {
      return s.replace(/{(\w+)}/g, function (m, p) {
        return c[p]
      })
    }
  return function (table, tab_name, dl_name, col_del_arr, callback) {
    //ex. tableToExcel('table-datamap', 'Sheet1', 'School-export', [3,4]);
    //ex. tableToExcel('table-datamap', 'Sheet1', 'School-export', [3,4], function(res){  });
    //console.log('font_size: '+font_size+' | font_family: '+font_family);
    var template =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->  <style>table { border-collapse: collapse; } table,th, td { border: thin solid black; }</style></head><body><table>{table}</table></body></html>'

    if (!table.nodeType) {
      table = document.getElementById(table)
    }
    if (!dl_name) {
      dl_name = $.trim($(table).attr("id")) + ""
    }

    var _data_tag
    if (col_del_arr) {
      var n = 0
      var th = "",
        td = ""
      $(col_del_arr).each(function (index, val) {
        if (n > 0) {
          th += ","
          td += ","
        }
        th += "thead tr th:nth-child(" + val + ")"
        td += "tbody tr td:nth-child(" + val + ")"
        n++
      })
      console.info(th + "," + td)
      _data_tag = $(table)
        .clone()
        .find("img")
        .remove()
        .end()
        .find(th + "," + td)
        .remove()
        .end()
        .html()
    } else {
      _data_tag = $(table).clone().find("img").remove().end().html()
    }

    var ctx = {
      worksheet: tab_name || "Sheet1",
      table: _data_tag,
    }

    //console.log( '>>> '+_data_tag );

    //window.location.href = uri + base64(format(template, ctx))
    var link = document.createElement("a")
    link.href = uri + base64(format(template, ctx))
    link.download = dl_name + ".xls" || "Workbook.xls"
    // link.target = '_blank';
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    if (callback) {
      callback(true)
    }
  }
})()

// Fix bug ckeditor4 คลิก modal link ไม่ได้
$.fn.modal.Constructor.prototype._enforceFocus = function () {
  var $modalElement = this.$element
  $(document).on("focusin.modal", function (e) {
    // if ($modalElement[0] && $modalElement[0] !== e.target &&
    //     !$modalElement.has(e.target).length &&
    //     $(e.target).parentsUntil('*[role="dialog"]').length === 0) {
    //     $modalElement.focus();
    //     console.info(111)
    // }
  })
}

function fnc_layer_rename(name) {
  if (name.indexOf(".") !== -1) {
    return name.split(".")[0]
  } else {
    return name
  }
}

function fileExists(url, callback) {
  if (url) {
    var req = new XMLHttpRequest()
    req.open("GET", url, false)
    req.send()
    if (req.status == 200) {
      callback(req.response)
    } else {
      callback(false)
    }
  }
}

function writeTextFile(afilename, output) {
  var txtFile = new File(afilename)
  txtFile.writeln(output)
  txtFile.close()
}
