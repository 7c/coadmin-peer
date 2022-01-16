const ntpClient = require('ntp-client');

ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
    if(err) {
        console.error(err);
        return;
    }
    let local_time = new Date()
    let diff = local_time.getTime()-date.getTime()
    console.log("Time at pool.ntp.org :",date)
    console.log("Localtime :",local_time)
    console.log("Difference :",diff,"ms")
    if (diff>1000) {
        console.log(`Difference is too big!!`)
        process.exit(1)
    }
    // console.log(date)
    // console.log(new Date(date).getTime())
});