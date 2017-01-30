const beginICalendar = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//lanyrd.com//Lanyrd//EN\nX-ORIGINAL-URL:http://lanyrd.com/2016/xpdays/xpdays-schedule.ics\nX-WR-CALNAME;CHARSET=utf-8:XP Days Ukraine 2016 schedule\nMETHOD:PUBLISH\nX-MS-OLK-FORCEINSPECTOROPEN:TRUE\n";
const endICalendar = "END:VCALENDAR";
const maxLengthProperty = 70;
let google_events = "";
let dtStamp = dtStampGenerate();

var xhr = new XMLHttpRequest();
xhr.onload = function(){
	google_events = xhr.responseText;
	let google_events_obj = JSON.parse(google_events);
	google_events = beginICalendar;
	for (let i = 0; i < google_events_obj.length; i++) {
	 	google_events = eventToICalendar(google_events_obj[i], google_events);
	}
	google_events += endICalendar;
	download(google_events, "calendar", "ics");
}
xhr.open('GET', 'http://javascript.kiev.ua/attach/icalendar/google_events.json', true);
xhr.send( );

//возможно лучше использовать метод concat вместо +=?
function eventToICalendar(event, google_events){
	google_events += "BEGIN:VEVENT\n";
	google_events += "TITLE:" + contentLinesRFC(event.title) + "\n";
	google_events += "CLASS:" + event.className[0] + "\n";
	google_events += "SUMMARY:\n";
	google_events += "LOCATION:" + contentLinesRFC(event.location) + "\n";
	google_events += "URL:" + event.url + "\n";
	google_events += "UID:" + event.id + "\n";
	google_events += "DTSTAMP:" + dtStamp + "\n";
	google_events += "DTSTART:" + cleaningDate(event.start) + "\n";
	google_events += "DTEND:" + cleaningDate(event.end) + "\n";
	google_events += "ALLDAY:" + event.allDay.toString() + "\n";
	google_events += "ICONURL:" + event.iconUrl + "\n";
	google_events += "DESCRIPTION:" + "\n";
	google_events += "END:VEVENT\n";
	return google_events;
}

// Вычисляем вес строки в байтах
String.prototype.byteLength = function(){
   var str = this, length = str.length, count = 0, i = 0, ch = 0;
   for(i; i < length; i++){
     ch = str.charCodeAt(i);
     if(ch <= 127){
        count++;
     }else if(ch <= 2047){
        count += 2;
     }else if(ch <= 65535){
        count += 3;
     }else if(ch <= 2097151){
        count += 4;
     }else if(ch <= 67108863){
        count += 5;
     }else{
        count += 6;
     }    
  }
  return count;
};

// редактируем слишком длинные строки в соответствии со спецификацией RFC
function contentLinesRFC(str){
	str += "";
	if(str.byteLength() > maxLengthProperty){
		result = str.slice(0, str.length/2) + "\n" + " ";
		result += str.slice(str.length/2, str.length-1);
		return result;
	}
}

// форматируем дату
function cleaningDate(date){
	date = date.slice(0,10);
	for (var i = 0; i < date.length; i++) {
		date = date.replace(":", "");
		date = date.replace("-", "");
		date = date.replace("+", "");
	}
	return date;
}

// Function to download data to a file
function download(data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

// устанавливаем значение текущей даты в dtStamp форматируя его под формат ICS
function dtStampGenerate(){
	var d = new Date();
	var datestring = d.getFullYear() + "" + ("0"+(d.getMonth()+1)).slice(-2) + ("0" + d.getDate()).slice(-2) + "T"
	+ d.getHours() + "" + ("0"+(d.getMinutes()+1)).slice(-2) + "" + ("0"+(d.getSeconds()+1)).slice(-2);
	return datestring;
}
