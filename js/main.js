const beginICalendar = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//lanyrd.com//Lanyrd//EN\nX-ORIGINAL-URL:http://lanyrd.com/2016/xpdays/xpdays-schedule.ics\nX-WR-CALNAME;CHARSET=utf-8:XP Days Ukraine 2016 schedule\nMETHOD:PUBLISH\nX-MS-OLK-FORCEINSPECTOROPEN:TRUE\n";
const endICalendar = "END:VCALENDAR";
const maxLengthProperty = 70;
let googleEvents = "";
let dtStamp = dtStampGenerate();

var xhr = new XMLHttpRequest();
xhr.onload = function(){
	googleEvents = xhr.responseText;
	let googleEvents_obj = JSON.parse(googleEvents);
	googleEvents = beginICalendar;
	for (let i = 0; i < googleEvents_obj.length; i++) {
	 	googleEvents = eventToICalendar(googleEvents_obj[i], googleEvents);
	}
	googleEvents += endICalendar;
	// c 9 по 15 строку нужно вынести в отдельную функцию 
	download(googleEvents, "calendar", "ics");
}
xhr.open('GET', 'http://javascript.kiev.ua/attach/icalendar/googleEvents.json', true);
xhr.send( );


function eventToICalendar(event, googleEvents){
	var newLine = "\n";
	googleEvents += "BEGIN:VEVENT\n";
	googleEvents += "TITLE:" + contentLinesRFC(event.title) + "\n";
	googleEvents += "CLASS:" + event.className[0] + "\n";
	googleEvents += "SUMMARY:\n";
	googleEvents += "LOCATION:" + contentLinesRFC(event.location) + "\n";
	googleEvents += "URL:" + event.url + "\n";
	googleEvents += "UID:" + event.id + "\n";
	googleEvents += "DTSTAMP:" + dtStamp + "\n";
	googleEvents += "DTSTART:" + cleaningDate(event.start) + "\n";
	googleEvents += "DTEND:" + cleaningDate(event.end) + "\n";
	googleEvents += "ALLDAY:" + event.allDay.toString() + "\n";
	googleEvents += "ICONURL:" + event.iconUrl + "\n";
	googleEvents += "DESCRIPTION:" + "\n";
	googleEvents += "END:VEVENT\n";
	return googleEvents;
}

// Вычисляем вес строки в байтах
String.prototype.byteLength = function(){
	var byteCounts = [127, 2047, 65535, 2097151, 67108863];
    var str = this, length = str.length, count = 0, i = 0, ch = 0;
    for(i; i < length; i++){
		ch = str.charCodeAt(i);
		if(ch <= byteCounts[0]){
		    count++;
		}else if(ch <= byteCounts[1]){
		    count += 2;
		}else if(ch <= byteCounts[2]){
		    count += 3;
		}else if(ch <= byteCounts[3]){
		    count += 4;
		}else if(ch <= byteCounts[4]){
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
	date = date.slice(0, 10);
	for (var i = 0; i < date.length; i++) {
		date = date.replace(/:|-|\+/g, "");
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
/**
	Можно так (только часовой пояс попдправить):
	let now = new Date();
	now.toISOString().replace(/-|:|\..*$/g, ""); 
 **/
function dtStampGenerate(){
	var now = new Date();
	var dateString = now.getFullYear() + "" + ("0"+(now.getMonth()+1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "T"
	+ now.getHours() + "" + ("0"+(now.getMinutes()+1)).slice(-2) + "" + ("0"+(now.getSeconds()+1)).slice(-2);
	return dateString;
}
