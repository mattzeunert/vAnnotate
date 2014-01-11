/*
	
Code to set up the log collection and to send it back to the server.

*/
(function(window){
	var RESULT_SAVE_INTERVAL = 1000,
		logResults = {},
		fileId = '{{{fileId}}}',
		vAnnotate = {
			log: function(i, value){
				logResults[i] = value;
			}
		}

	{{{serializeLogResult}}}

	function sendResults(){
		var xmlhttp = new XMLHttpRequest();

		var serializedLogResults = {};
		for (var key in logResults){
			var logResult = logResults[key];
			serializedLogResults[key] = serializeLogResult(logResult);
		}
		data = JSON.stringify(serializedLogResults);

	    xmlhttp.open("POST", "/vAnnotate/results", true);
	    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xmlhttp.send('results=' + data + '&fileId=' + fileId);
	};

	setInterval(sendResults, RESULT_SAVE_INTERVAL);
	setTimeout(sendResults, 0); // Run once all page initialization code has run

	window.vAnnotate = vAnnotate;
})(window);