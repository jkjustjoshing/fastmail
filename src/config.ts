const hoursPast = (hours: number) => {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString().replace(/\.\d+Z/, 'Z')
}


const config: Config[] = [
  {
    name: 'USPS in inbox',
    search: {
      in: 'inbox',
      before: hoursPast(18),
      from: 'USPSInformeddelivery@informeddelivery.usps.com'
    },
    action: {
      archive: true,
      markRead: true
    }
  },
  {
    name: 'USPS not in inbox',
    search: {
      in: 'archive',
      isUnread: true,
      before: hoursPast(18),
      from: 'USPSInformeddelivery@informeddelivery.usps.com'
    },
    action: {
      markRead: true
    }
  },
  {
    name: 'This Week at The Little',
    search: {
      in: 'inbox',
      before: hoursPast(48),
      from: 'thelittle.org',
      subject: 'This Week at The Little'
    },
    action: {
      markRead: true,
      archive: true
    }
  },
  {
    name: 'League of Women Voters',
    search: {
      in: 'inbox',
      before: hoursPast(5 * 24),
      isUnread: true,
      from: 'lwvny.org'
    },
    action: {
      markRead: true,
      archive: true
    }
  }
]
export default config

type Config = {
  name: string,
  search: {
    in?: 'inbox' | 'archive',
    before?: string,
    from?: string,
    subject?: string,
    isUnread?: boolean
  },
  action: {
    archive?: boolean,
    markRead?: boolean
  }
}
