const functions = require("firebase-functions");

// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp();
const database = admin.firestore();

exports.rideNotification = functions.firestore.document("Rides/{rideId}")
    .onUpdate(async (change, context) => {
        console.log("ride update function called");
        // console.log("Ride id ===>", change.id);
        // the previous value before this update
        const previousValue = change.before.data();

        // Get an object representing the current document
        const ride = change.after.data();


        if(ride.isRideCancelled == true) {
            console.log("ride cancelled");
            const rider = await database.collection("app_user").doc(ride.postById).get();
            var passengers = await database.collection("Rides").doc(ride.rideId).collection("Passengers").get();
            for (let index = 0; index < passengers.length; index++) {
                const userData = await database.collection("app_user").doc(passengers[index].id).get();
                sendNotification(userData.data().fcmToken, rider.data());
                // const element = array[index];     
            }
        }


        function sendNotification(notificationToken, rider) {
            const title = "Ride";
            const body = "The ride joined with "+ rider.name +" was cancelled";
            const payload = {
                notification: { title: title, body: body},
                token: notificationToken,  
            };

            admin.messaging().send(payload).then(response => {
                return console.log("Successful Notification Sent");
            }).catch(error => {
                return console.log("Error Sending Notification");
            });
        }
        return console.log("End Of Function");

    });

