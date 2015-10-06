var userservice = require('../services/userservice');
var utils = require('../modules/utils');
var seafile = require('../modules/seafile');
var config = require('../config');

//get all users
userservice.getUsers(function(err, users) {
    if (err) console.log(err);

    function processOne(i){
        var user = users[i];
        user.password = utils.uid(10);

        console.log('Start creating', user.username);

        //add user to seafile
        seafile.createUser(user).then(function() {
            console.log('Created', user.username);

            //if there are still rows to proceed, do the next one
            console.log(i);
            if(i > 0){
                console.log('There is more stuff to do');
                setTimeout(function(){
                    processOne(--i);
                }, 500);
            }else{
                console.log('Nothing more to do. Finished!');
            }

            if (user.type == 'club' && !user.former) { //dont put former users into groups
                //add club users to "allgemein" group, but not the applicants
                if (!user.applicant) seafile.addToGroup(user.username, 'allgemein').then(function(){
                    console.log('Added ' + user.username + ' to group "allgemein"');
                }).catch(function(){
                    console.log('Error adding ' + user.username + ' to group "allgemein"');
                });

                //add executives to "vorstand" group
                if (user.executive) seafile.addToGroup(user.username, 'vorstand').then(function(){
                    console.log('Added ' + user.username + ' to group "vorstand"');
                }).catch(function(){
                    console.log('Error adding ' + user.username + ' to group "allgemein"');
                });

                //other users will have no pre-assigned groups
            }



        });
    }

    //start with the last one
    processOne(users.length - 1);

});
