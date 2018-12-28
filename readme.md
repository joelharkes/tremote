# TRemote

> What if connecting to your customer servers could be as simple as one click?

App that provides magnet link support for vpns and remote desktop applications. 
You can store all your customer connection info in your own web application and simply let it make url: `tremote://action?options`.
Tremote will handle this magnet link and start the right application on your computer: windows vpn, cisco vpn, shrewsoft vpn, remote desktop, teamviewer etc.

## Run this project

1. Clone this repository
1. install packges: `yarn install`
1. Run development: `yarn start` (`yarn start-web` if you want to debug main process)
1. Run production: `yarn prod`

## Deploy/release/package

Run the `electron-builder` with `yarn pack` and wait until its finished (+-30sec).
It will build with the version found in the `package.json`. 

When finished you will find your executable in the `/dist` directory (eg: `tremote Setup 1.3.0.exe`).


## Contributions

All contributions are welcome simply add Pull requests.


A list of things Todo:
* Cleanup classes.
* Proper vpn detection.
* Migrate to Material-ui V1 (now v0)
* 2 way communications between main and render process:
  * Use Mobx state tree to sync state both ways (send snapshots)
  * Stream logs when in log menu view. (and use fix rotating array for mem log)
* Finish the widgets: (+ button should show list op possible widgets, now only one)
* Extra implementations:
  * Sophos client
  * Fix rdp gateway credentials (remove them properly when saved (for Profit Online))
