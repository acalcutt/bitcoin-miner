function Miner() {
  
	var self = this;
	var acceptedShares = 0;
	var doingLp = false;
	var totalHashes = 0;
	var blocks =1;

    var nonce = 0;
    var maxNonce = 0;
    var scrypt = (function() {
    	var inputPTR = Module._malloc(80);
    	var outputPTR = Module._malloc(32);
    
    	var input = Module.HEAPU8.subarray(inputPTR, inputPTR + 80)
    	var output = Module.HEAPU8.subarray(outputPTR, outputPTR + 32);
    
    	var scrypt = Module.cwrap('SCRYPT', null, ['number', 'number']);
    
    	return {
    		input: input
    		, output: output
    		, hash: function() {
    			scrypt(inputPTR, outputPTR);
    		}
    	};
    })();
    
	this.Notification = {
			SYSTEM_ERROR : 0,
			PERMISSION_ERROR : 1,
			CONNECTION_ERROR : 2,
			AUTHENTICATION_ERROR : 3,
			COMMUNICATION_ERROR : 4,
			LONG_POLLING_FAILED : 5,
			LONG_POLLING_ENABLED : 6,
			NEW_BLOCK_DETECTED : 7,
			NEW_WORK : 8,
			POW_TRUE : 9,
			POW_FALSE : 10,
			TERMINATED : 11,
			STARTED: 12
		};
	
	
	this.lastWorkTime = 0;
	this.lastWorkHashes = 0;
	

// 	console.log("Setting up LongPoll");
// 	longpoll = new Worker('js/longpoll.js');

// 	longpoll.onmessage = function (e) {
// 		if (worker != null) {
// 			worker.terminate();
// 		}
// 		worker = new Worker('js/worker.js'); 
// 		worker.onmessage = workerMessage;
// 		worker.postMessage({'cmd': 'start'});
// 		blocks++;
// 	}

// 	 console.log("Setting up worker"); 
// 	worker = new Worker('js/worker.js');

// 	worker.onmessage  = workerMessage;

function hex2Buf(str) {
	var r = [];

	for (var i = 0, x = str.length; i < x; i += 2) {
		r.push(parseInt(str.substr(i, 2), 16));
	}

	return r;
};

function buf2Hex(buf) {
	var r = '';

	for (var i = 0, x = buf.length; i < x; i += 1) {
		r += (buf[i] <= 0xf ? '0' : '') + buf[i].toString(16);
	}

	return r;
};

function unpackWork(msg) {
	var buf = hex2Buf(msg);

	// Copy it into the input
	for (var i = 0; i < 76; i += 1) {
		scrypt.input[i] = buf[i];
	}

	// Set the start and end
	nonce = (buf[76] | (buf[77] << 8) | (buf[78] << 16) | (buf[79] << 24)) >>> 0;
	maxNonce = (buf[80] | (buf[81] << 8) | (buf[82] << 16) | (buf[83] << 24)) >>> 0;

	workLoop();
};

function workLoop() {
	while (nonce < maxNonce) {	
		scrypt.input[76] = nonce & 0xff;
		scrypt.input[77] = (nonce >> 8) & 0xff;
		scrypt.input[78] = (nonce >> 16) & 0xff;
		scrypt.input[79] = (nonce >> 24) & 0xff;

		scrypt.hash();

		// We're just doing a simple share system, so this is the only check
		if (scrypt.output[31] == 0 && scrypt.output[30] <= 6) {
			self.postMessage(buf2Hex(scrypt.input) + buf2Hex(scrypt.output));
		}

		// Increase the nonce
		nonce += 1;
	}

	self.postMessage(false);
};
	 function workerMessage(e) {
		
		var notification = e.data.notification;
		var tempHashes =  Number(e.data.workerHashes);
		totalHashes = tempHashes;
		var workerHashes = tempHashes;
		var logMessage = e.data.logMessage;
		var hashRate = e.data.hashRate;
		var total_display;
		var speed_display;
		if ( typeof notification != 'undefined') {
		if ( notification == self.Notification.POW_TRUE )
			{
				console.log("Pool accepted the share");
			acceptedShares = acceptedShares + 1;
		}
		}

               if (workerHashes > 1000 )                         
                {
                        if (workerHashes > 1000000)                         
                              total_display = (workerHashes / 1000000).toFixed(0) +"M";                                   
                        else                
                              total_display = (workerHashes / 1000).toFixed(0) + "K";                                                   
                }
                else            
                        total_display = workerHashes;

                if (hashRate > 1000 )                                  
                {             
		           if (hashRate > 1000000)                         
                              speed_display = (hashRate /  1000000) +"M/s";                             

                        else           
			{
                                      var temp_speed = hashRate / 1000;                         
                                      if (temp_speed != undefined)                    
                                      {              
                                              var new_speed = temp_speed.toFixed(2);                         

                                              speed_display = new_speed + "K/s";                        
                                      }     
                                      else     
                                              speed_display = "0 K/s";                  
                              }    
                }
                else    
                        speed_display =             hashRate;

                if(speed_display!=null) {
                                                                                                                                                                                                                                                                                                                                                 
		document.getElementById('hashes-per-second').innerHTML = speed_display;
                                                                                                                                                                                                                                                                                                                                                 
                } 
                                                                                                                                                                                                                                                                                                                                                 
                if(total_display!=null) {                                                                                                                                                                                                                                                                                                         
                                                                                                                                                                                                                                                                                                                                                 
				document.getElementById('total-hashes').innerHTML= total_display;
                }                                                                                                                                                                                                                                                                                                                                
		
		document.getElementById('gt-response').innerHTML= acceptedShares.toString();

		document.getElementById('gt-blocks').innerHTML= blocks.toString();

		var message = '';

		if(notification!=null) {
			
			switch(notification) {
			
				case self.Notification.SYSTEM_ERROR: message = 'System error.'; break;
				case self.Notification.PERMISSION_ERROR: message = 'Permission error.'; break;
				case self.Notification.CONNECTION_ERROR: message = 'Connection error, retrying in ' + retryPause/1000 + ' seconds.'; break;
				case self.Notification.AUTHENTICATION_ERROR: message = 'Invalid worker username or password.'; break;
				case self.Notification.COMMUNICATION_ERROR: message = 'Communication error.'; break;
				case self.Notification.LONG_POLLING_FAILED: message = 'Long polling failed.'; break;
				case self.Notification.LONG_POLLING_ENABLED: message = 'Long polling activated.'; break;
				case self.Notification.NEW_BLOCK_DETECTED: message = 'LONGPOLL detected new block.'; break;
				case self.Notification.NEW_WORK: 
	
				message = 'Started new work.';
							

				self.lastWorkTime = (new Date()).getTime();
				self.lastWorkHashes = workerHashes;

				break;
				
				case self.Notification.POW_TRUE: message = 'PROOF OF WORK RESULT: true (yay!!!)'; break;
				case self.Notification.POW_FALSE: message = 'PROOF OF WORK RESULT: false (booooo)'; break;
				case self.Notification.TERMINATED: message = 'Terminated.'; break;
				case self.Notification.STARTED: message = 'Worker started.'; break;
			
	
			}
		
		}
		
		if(message!=null
				&& message!='') {
		
			self.logger(message);
		
		}
		
		if(logMessage!=null && logMessage!='') {
			
			self.logger(logMessage);
			
		}

    };
	
	// Start Worker
	this.startWorker = function() { 
		worker.postMessage({'cmd': 'start'});
	};
	

	// Stop Worker
	this.stopWorker = function() { 
		worker.terminate();
	};
	
	
    this.logger = function(str) {
		
    //	var logElement = document.getElementById('log');
   // 	logElement.innerHTML =logElement.innerHTML + "<br/>" + str;
	console.log(str);		
	};
	
	var socket = io.connect();
	
	socket.on('connect', function () {
          socket.emit('message', 'getwork');
        });

    
    socket.on('work', function (work) {
          unpackWork(work);
        });
        
}
