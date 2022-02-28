var port;
var lineBuffer = '';

const filters = [
  // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
	{ usbVendorId: 0x2341, usbProductId: 0x0043 },
	{ usbVendorId: 0x2341, usbProductId: 0x0001 },
	{ usbVendorId: 0x1a86, usbProductId: 0x7523 },
];

var pm_s = [0,0,0,0,0,
			0,0,0,0,0,
			0,0,0,0,0,
			0,0,0,0,0,
			0,0,0,0,0];

async function getReader() {
	var port = await navigator.serial.requestPort({ filters });

	try {
		await port.open({ baudRate: 9600 });
		const reader = port.readable.getReader();
		// Listen to data coming from the serial device.
		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				// Allow the serial port to be closed later.
				reader.releaseLock();
				break;
			}
			// value is a Uint8Array.
			update_from_pm(String.fromCharCode.apply(null, value).split("\r\n"));
		}
	}
	catch (err) {
		window.alert(err.message);
	}
	
	
}

function update_from_pm(codes) {

	let trigger = false;
	for (code of codes) {
		let decoded = code.split(":")
		if (decoded.length==2) {
			let index=parseInt(decoded[0]);
			let value=parseInt(decoded[1]);

			if (index>=0 && index<25 && value>=0 && value<16) {
				// seems valid
				let b=0;
				if (value!=0) b=1;
				if (pm_s[index]!=b) {
					trigger=true;
					pm_s[index]=b;
					console.log(code)
				}
			}
		}
	}

	if (trigger) {
		write_draft_interface([

			[pm_s[20],pm_s[15],pm_s[10],pm_s[5],pm_s[0]],
			[pm_s[21],pm_s[16],pm_s[11],pm_s[6],pm_s[1]],
			[pm_s[22],pm_s[17],pm_s[12],pm_s[7],pm_s[2]],
			[pm_s[23],pm_s[18],pm_s[13],pm_s[8],pm_s[3]],
			[pm_s[24],pm_s[19],pm_s[14],pm_s[9],pm_s[4]],

		]);
		
	}	
}

function listSerial(){	
	if (port) {
		port.close();
		port = undefined;
	}
	else {
		console.log("Look for Serial Port")
		getReader();
	}
}
