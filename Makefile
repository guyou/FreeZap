.PHONY: dist-ubuntu-touch dist-firefox-os

dist-firefox-os:
	sh ./build.sh

dist-ubuntu-touch:
	click build -I manifest.webapp -I Makefile -I build -I build.sh .
