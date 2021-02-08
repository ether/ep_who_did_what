![Publish Status](https://github.com/ether/ep_who_did_what/workflows/Node.js%20Package/badge.svg) ![Backend Tests Status](https://github.com/ether/ep_who_did_what/workflows/Backend%20tests/badge.svg)

![https://user-images.githubusercontent.com/220864/85917969-ab5e3e80-b856-11ea-8263-4ca7c29fbde5.png](https://user-images.githubusercontent.com/220864/85917969-ab5e3e80-b856-11ea-8263-4ca7c29fbde5.png)

## Who made what changes to a pad?

And when?  This plugin aids to help authors that have been absent from a pad only to return and find that the content they contributed has been removed.  The author can see who removed content and also who added new content.

To use the plugin visit the timeslider and click the Magnifying glass button.  Find the offending revision and click on it to update the timeslider to watch that edit.

Where did your content go?  Find out and chastise whoever removed it!  More importantly find out the pad contents before someone deleted it all and click the export button to Export the good state to a new pad.  Ideal for mitigating against trolls and people out to destroy pad contents.

# Installing

Option 1.

Use the ``/admin`` interface, search for ``ep_who_did_what`` and click Install

Option 2.
```
npm install ep_who_did_what
```

Option 3.
```
cd your_etherpad_install/node_modules
git clone https://github.com/JohnMcLear/ep_who_did_what
```

# Bug Reports

Please submit bug reports or patches at https://github.com/JohnMcLear/ep_who_did_what/issues

# Todo
- [ ] Use Locales file
- [ ] Full test coverage
- [ ] Test Mobile UX
- [ ] Provide Granuality / Threshold support (currently a fixed value of 1% of total edits)
- [ ] Author colors onto report (should be easy)
- [ ] Rate limit requests
