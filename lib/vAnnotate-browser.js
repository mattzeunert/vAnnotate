/*

Code to set up the log collection and to send it back to the server.

*/
// Set up global vAnnotate object if it doesn't exist already
(function(window){
    {{{serializeLogResult}}}

    if (!window.vAnnotate){
        var logResults = {},
            vAnnotate = {
                log: function(fileId, i, value){
                    logResults[fileId][i] = serializeLogResult(value);
                },
                _logResults: logResults
            }
        window.vAnnotate = vAnnotate;
    }
})(window);
// Set up code for this file
(function(window){
	var RESULT_SAVE_INTERVAL = 1000,
		fileId = '{{{fileId}}}',
        vAnnotate = window.vAnnotate;



    vAnnotate._logResults[fileId] = {};

	function sendResults(){
		var xmlhttp = new XMLHttpRequest(),
            logResults = vAnnotate._logResults[fileId];

		data = JSON.stringify(logResults);

	    xmlhttp.open("POST", "/vAnnotate/results", true);
	    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      // We need encodeURIComponent because the data might contain an ampersand...
	    xmlhttp.send('results=' + encodeURIComponent(data) + '&fileId=' + encodeURIComponent(fileId));
	};

	setInterval(sendResults, RESULT_SAVE_INTERVAL);
	setTimeout(sendResults, 0); // Run once all page initialization code has run
})(window);
