// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const fetch = require('node-fetch');

export default async function handler(req, res) {
  let username = process.env.FASTMAIL_USERNAME;
  let password = process.env.FASTMAIL_PASSWORD;
  let authBasic = Buffer(username + ':' + password).toString('base64');
  let session = await (await fetch('https://jmap.fastmail.com/.well-known/jmap', {
    headers: {
      "Authorization": "Basic " + authBasic
    }
  })).json();

  let accountId = session['primaryAccounts']['urn:ietf:params:jmap:mail'];

  const request = getRequest(authBasic, accountId)

  let mailboxes = await request('Mailbox/get', { ids: null })

  const inbox = mailboxes.list.find(mailbox => mailbox.role === 'inbox')
  const archive = mailboxes.list.find(mailbox => mailbox.role === 'archive')

  let mail = await request('Email/query', {
    filter: {
      inMailbox: inbox.id,
      from: 'usps',
      before: hoursPast(30)
    },
    sort: [
      { property: 'receivedAt', isAscending: false }
    ],
    position: 0,
    collapseThreads: true,
    limit: 13,
    calculateTotal: true
  })

  let mailContent = await request('Email/get', { ids: mail.ids, properties: [ 'threadId' ] })

  await request('Email/set', {
    update: Object.fromEntries(mailContent.list.map(mc => {
      return [mc.id, {
        [`mailboxIds/${archive.id}`]: true,
        [`mailboxIds/${inbox.id}`]: null
      }]
    }))
  })

  // let threadItemIds = await request('Thread/get', { ids: mailContent.list.map(c => c.threadId) })

  // let threadItems = await request('Email/get', {
  //   ids: threadItemIds.list.flatMap(t => t.emailIds),
  //   // fetchTextBodyValues: true
  // })
  res.json({ numberArchived: mailContent.list.length })
}

const getRequest = (authBasic, accountId) => async (method, args) => {
  let query = {
    using: [ "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail" ],
    methodCalls: [[method, { accountId, ...args}, "0" ]]
  }
  const req = await fetch('https://jmap.fastmail.com/api/', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + authBasic
    },
    body: JSON.stringify(query)
  })

  return (await req.json()).methodResponses[0][1];
}

const hoursPast = hours => {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString().replace(/\.\d+Z/, 'Z')
}
