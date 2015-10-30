var protocolsservice = require('../services/protocolsservice');
var config = require('../config');

exports.jobs = {'yAcTc2FIwEx4tvfkth1g4LiLt7ZBKtTA': 1};


exports.startTimer = function() {
    console.log('Protocol PDF job handler started...');

    for(var id in exports.jobs){
        //skip if this protocol doesnt have to be processed
        if(!exports.jobs[id]){
            continue;
        }

        protocolsservice.makePdf(id, '/tmp/', function(err, location, filename){
            if(err){
                console.log(err);
                return;
            }

            console.log('Created PDF', location, 'for filename', filename);

            //upload to seafile
            //TODO

            //remove id from job queue
            delete exports.jobs[id];
        });
    }

    //start next timer
    setTimeout(exports.startTimer, (config.protocols.pdfInterval * 1000));
}
