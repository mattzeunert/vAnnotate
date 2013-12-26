(function(window){
	var logResults = {};
	var vAnnotate = {
		log: function(i, value){
			logResults[i] = value;
		}
	}
	setTimeout(function(){
		var xmlhttp = new XMLHttpRequest();



		data = JSON.stringify(logResults);

	    xmlhttp.open("POST", "/vAnnotate/results", true);
	    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xmlhttp.send('results=' + data);
	}, 0);

	window.vAnnotate = vAnnotate;
})(window);