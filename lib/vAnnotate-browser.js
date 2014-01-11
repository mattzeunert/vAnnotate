/*
	
Code to set up the log collection and to send it back to the server.

*/
(function(window){
	var logResults = {};
	var fileId = '{{fileId}}';
	var vAnnotate = {
		log: function(i, value){
			logResults[i] = value;
		}
	}

	//###serializeLogResult###

	setTimeout(function(){
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
	}, 0);

	window.vAnnotate = vAnnotate;
})(window);