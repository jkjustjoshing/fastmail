
const fetch = require('node-fetch');
async function run() {
    let username = "josh@kramer.run";
    let password = process.env.PASSWORD;
    let authBasic = Buffer(username + ':' + password).toString('base64');
    let session = await (await fetch('https://jmap.fastmail.com/.well-known/jmap', {
        headers: {
            "Authorization": "Basic " + authBasic
        }
    })).json();
    let accountId = session['primaryAccounts']['urn:ietf:params:jmap:mail'];

    let query = {
        "using": [ "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail" ],
        "methodCalls": [[ "Mailbox/get", {
            "accountId": accountId,
            "ids": null
        }, "0" ]]
    }
    let data = await (await fetch('https://jmap.fastmail.com/api/', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + authBasic
        },
        body: JSON.stringify(query)
    })).json();
    console.log(data.methodResponses[0][1])
}

run();
