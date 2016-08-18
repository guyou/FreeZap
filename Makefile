.PHONY: dist-ubuntu-touch dist-firefox-os

.version: manifest.json
	sed -n '/"version":/s/.*"\([^"]*\)" *$$/\1/p' manifest.json > .version

dist-firefox-os:
	sh ./build.sh

dist-ubuntu-touch:
	click build -I manifest.webapp -I Makefile -I build -I build.sh .

install-ubuntu-touch: .version
	adb push freezap.febvre_`cat .version`_all.click /home/phablet/Downloads/
	adb shell pkcon install-local --allow-untrusted /home/phablet/Downloads/freezap.febvre_`cat .version`_all.click
