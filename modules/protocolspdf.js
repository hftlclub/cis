var protocolsservice = require('../services/protocolsservice');
var config = require('../config');
var log = require('../modules/log');

exports.jobs = {'yAcTc2FIwEx4tvfkth1g4LiLt7ZBKtTA': 1};


exports.addJob = function(id){
    exports.jobs[id] = 1;
    return;
}


exports.startTimer = function() {
    //cancel if job handler is inactive
    if(!config.protocols.bgJobActive){
        return;
    }

    //log.debug('Protocol PDF job handler started...');

    for(var id in exports.jobs){
        //skip if this protocol doesnt have to be processed
        if(!exports.jobs[id]){
            continue;
        }

        protocolsservice.makePdf(id, '/tmp/', function(err, location, filename){
            if(err){
                log.error(err);
                return;
            }

            log.debug('Automatically created PDF', location, 'for filename', filename);

            //remove id from job queue
            delete exports.jobs[id];
        });
    }

    //start next timer
    setTimeout(exports.startTimer, (config.protocols.bgJobInterval * 1000));
}
