.PHONY: dist-ubuntu-touch dist-firefox-os

.version: manifest.json
	sed -n '/"version":/s/.*"\([^"]*\)"[ ,]*$$/\1/p' manifest.json > .version

.name: manifest.json
	sed -n '/"name":/s/.*"\([^"]*\)"[ ,]*$$/\1/p' manifest.json > .name

dist-firefox-os:
	sh ./build.sh

dist-ubuntu-touch:
	click build -I manifest.webapp -I Makefile -I build -I build.sh .

install-ubuntu-touch: .version .name
	adb push `cat .name`_`cat .version`_all.click /home/phablet/Downloads/
	adb shell pkcon install-local --allow-untrusted /home/phablet/Downloads/`cat .name`_`cat .version`_all.click
