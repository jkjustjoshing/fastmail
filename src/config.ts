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
  },
  {
    name: 'League of Women Voters RMA',
    search: {
      in: 'inbox',
      before: hoursPast(5 * 24),
      isUnread: true,
      from: 'lwv-rma.org'
    },
    action: {
      markRead: true,
      archive: true
    }
  },
  {
    name: `Scott's Cheap Flights`,
    search: {
      in: 'inbox',
      before: hoursPast(6),
      from: 'hello@deals.scottscheapflights.com',
      allowPreventArchive: true
    },
    action: {
      markRead: true,
      archive: true
    }
  },
  {
    name: 'YJR',
    search: {
      in: 'inbox',
      before: hoursPast(24),
      from: 'events@yellowjacketracing.com',
      allowPreventArchive: true
    },
    action: { markRead: true, archive: true }
  },
  {
    name: 'Fleet Feet',
    search: {
      in: 'inbox',
      before: hoursPast(24),
      from: 'hello@email.fleetfeet.com',
      allowPreventArchive: true
    },
    action: { markRead: true, archive: true }
  },
  {
    name: 'Fleet Feet Ellen',
    search: {
      in: 'inbox',
      before: hoursPast(24),
      from: 'ellen@fleetfeetrochester.com',
      allowPreventArchive: true
    },
    action: { markRead: true, archive: true }
  },
  {
    name: '540 West Main',
    search: {
      in: 'inbox',
      before: hoursPast(24 * 3),
      from: '540westmain@kramer.run',
      allowPreventArchive: true
    },
    action: { markRead: true, archive: true }
  },
  {
    name: 'Receipts',
    search: {
      in: 'inbox',
      before: hoursPast(18),
      from: 'receipts@messaging.squareup.com',
    },
    action: { markRead: true, archive: true }
  },
  {
    name: 'Chortke Receipts',
    search: {
      in: 'inbox',
      before: hoursPast(18),
      from: 'chortke@kramer.run',
    },
    action: { markRead: true, archive: true }
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
    isUnread?: boolean,
    allowPreventArchive?: true
  },
  action: {
    archive?: boolean,
    markRead?: boolean
  }
}
