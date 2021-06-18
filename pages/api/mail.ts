import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch';
import config from '../../src/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await (await fetch('https://jmap.fastmail.com/.well-known/jmap', {
    headers: {
      "Authorization": req.headers.authorization
    }
  })).json();

  let accountId = session['primaryAccounts']['urn:ietf:params:jmap:mail'];

  const request = getRequest(req.headers.authorization, accountId)

  let [mailboxes] = await request('Mailbox/get', { ids: null })

  const inbox = mailboxes.list.find(mailbox => mailbox.role === 'inbox')
  const archive = mailboxes.list.find(mailbox => mailbox.role === 'archive')

  let mails = await request(...config.flatMap(c => [
    'Email/query',
    {
      filter: {
        inMailbox: c.search.in === 'inbox' ? inbox.id : c.search.in === 'archive' ? archive.id : undefined,
        from: c.search.from,
        before: c.search.before,
        notKeyword: c.search.isUnread ? '$seen' : undefined
      }
    }
  ]))

  if (!mails.some(m => m.ids.length)) {
    console.log('Ran, nothing to do')
    return res.end('OK')
  }
  console.log(config.map((c, index) => {
    const count = mails[index].ids.length
    if (!count) return null
    return {
      name: c.name,
      count
    }
  }).filter(Boolean))

  const update = mails.flatMap((mail, index) => {
    const configItem = config[index]
    return mail.ids.map(mailId => [
      mailId,
      {
        [`mailboxIds/${archive.id}`]: configItem.action.archive ? true : undefined,
        [`mailboxIds/${inbox.id}`]: configItem.action.archive ? null : undefined,
        'keywords/$seen': configItem.action.markRead ? true : undefined
      }
    ])
  })

  await request('Email/set', { update: Object.fromEntries(update) })

  console.log({
    archived: update.filter(u => u[1][`mailboxIds/${archive.id}`]).length,
    markedRead: update.filter(u => u[1][`keywords/$seen`]).length
  })
  return res.end('OK')
}

const getRequest = (auth, accountId) => async (...args) => {

  const methodCalls = []
  for(let i = 0; i < args.length; ++i) {
    if (i % 2 === 0) {
      methodCalls.push([args[i]])
    } else {
      methodCalls[methodCalls.length - 1].push({ accountId, ...args[i] })
      methodCalls[methodCalls.length - 1].push(String(methodCalls.length - 1))
    }
  }

  let query = {
    using: [ "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail" ],
    methodCalls
  }
  const req = await fetch('https://jmap.fastmail.com/api/', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    },
    body: JSON.stringify(query)
  })

  const json = await req.json()
  return json.methodResponses.map(r => r[1])
}

const hoursPast = hours => {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString().replace(/\.\d+Z/, 'Z')
}
