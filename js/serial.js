var port;
var lineBuffer = '';

async function getReader() {
	var port = await navigator.serial.requestPort({});
	await port.open({ baudRate: 9600 });
	const appendStream = new WritableStream({
		write(chunk) {
			lineBuffer += chunk;
			var lines = lineBuffer.split('n');				
			while (lines.length > 1) {
				var message=lines.shift();
				console.log(message);
				document.getElementById("info").innerHTML=message;
			}
			lineBuffer = lines.pop();
		}
	});
	port.readable
		.pipeThrough(new TextDecoderStream())
		.pipeTo(appendStream);	
}

var str55="1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1";
var str44="1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1";
function listSerial(){

	
	
	write_draft_interface( [[1,0,0,0],
							[0,1,0,0],
							[0,0,1,0],
							[0,0,0,1]]);
	
	if (port) {
		port.close();
		port = undefined;
	}
	else {
		console.log("Look for Serial Port")
		getReader();
	}
}
