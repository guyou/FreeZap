Crafty.scene('Zap', function() {
    var self = this;

    this.keys = [
        [
            "1", // Bouton 1
            "2", // Bouton 2
            "3", // Bouton 3
            "4", // Bouton 4
            "5"  // Bouton 5
        ],
        [
            "6", // Bouton 6
            "7", // Bouton 7
            "8", // Bouton 8
            "9", // Bouton 9
            "0"  // Bouton 0
        ],
        [
            "vol_inc", // Bouton volume +
            "red",     // Bouton rouge
            "up",      // Bouton haut
            "blue",    // Bouton bleu
            "prgm_inc" // Bouton programme +
        ],
        [
            null,
            "left",    // Bouton gauche
            "ok",      // Bouton ok
            "right",   // Bouton droite
            null
        ],
        [
            "vol_dec", // Bouton volume -
            "green",   // Bouton vert
            "down",    // Bouton bas
            "yellow",  // Bouton jaune
            "prgm_dec" // Bouton programme -
        ],
        [
            "bwd",  // Bouton << retour arrière
            "play", // Bouton Lecture / Pause
            "play", // Bouton Lecture / Pause
            "fwd",  // Bouton >> avance rapide
            "rec"   // Bouton Rec
        ],
        [
            "mute", // Bouton sourdine
            "home", // Bouton Free
            "home", // Bouton Free
            "home", // Bouton Free
            "power" // Bouton Power
        ]
    ];

    this.periodicalTimeout = null;
    this.periodicalInterval = null;

    function init() {
        self.overshadow = Crafty.e('Overshadow');
        
        for (y = 0; y < 7; y++) {
            for (x = 0; x < 5; x++) {
                if (y === 6 && (x === 1 || x === 2 || x === 3)) {
                    // Free key
                    if (x === 2 || x === 3) {
                        continue;
                    }
                    Crafty.e('Key').key(x, y, 3, 1);
                }
                else {
                    Crafty.e('Key').key(x, y, 1, 1);
                }
            }
        }
    }

    function sendKey(key) {
        var zap = App.zaps[App.active];
        var keyCode = self.keys[key.coords.y][key.coords.x];

        $.ajax({
            url: 'http://' + zap.player + '.freebox.fr/pub/remote_control',
            data: {
                code: zap.code,
                key: keyCode,
                long: keyCode === 'bwd' || keyCode === 'fwd' ? true : false
            },
            dataType: 'jsonp',
            error: function(jqXHR, textStatus, errorThrown) {
                if (textStatus === 'error') {
                    if (navigator.onLine) {
                        utils.status.show(navigator.mozL10n.get('invalid-remote-control-code'));
                    }
                    else {
                        utils.status.show(navigator.mozL10n.get('no-wifi-connection'));
                    }
                }
                else if (textStatus === 'timeout') {
                    utils.status.show(navigator.mozL10n.get('no-wifi-connection'));
                }
            },
            timeout: 1000,
            type: 'GET'
        });
    }

    function sendKeyPeriodically(key, msec) {
        self.periodicalInterval = window.setInterval(
            function() {
                sendKey(key);
            },
            msec
        );
    }

    this.uniqueBind('KeyTouchDown', function(key) {
        var keyCode = self.keys[key.coords.y][key.coords.x];
        if (keyCode === null) {
            return;
        }

        if (App.keysVibration) {
            window.navigator.vibrate(50);
        }
        if (key.coords.y === 6 && (key.coords.x === 1 || key.coords.x === 2 || key.coords.x === 3)) {
            self.overshadow.show(1, 6, 3, 1);
        }
        else {
            self.overshadow.show(key.coords.x, key.coords.y, 1, 1);
        }

        if (App.active === null) {
            return;
        }

        if (keyCode === 'vol_dec' || keyCode === 'vol_inc' ||
            keyCode === 'left' || keyCode === 'right' ||
            keyCode === 'up' || keyCode === 'down') {
            self.periodicalTimeout = window.setTimeout(
                function() {
                    sendKeyPeriodically(
                        key,
                        keyCode === 'vol_dec' || keyCode === 'vol_inc' ? 50 : 150
                    );
                },
                500
            );
        }
    });

    this.uniqueBind('KeyTouchOut', function(key) {
        self.overshadow.hide();

        if (self.periodicalTimeout) {
            window.clearTimeout(self.periodicalTimeout);
            self.periodicalTimeout = null;
        }
        if (self.periodicalInterval) {
            window.clearInterval(self.periodicalInterval);
            self.periodicalInterval = null;
        }
    });

    this.uniqueBind('KeyTouchUp', function(key) {
        self.overshadow.hide();

        var keyCode = self.keys[key.coords.y][key.coords.x];
        if (keyCode === null) {
            return;
        }

        if (self.periodicalTimeout) {
            window.clearTimeout(self.periodicalTimeout);
            self.periodicalTimeout = null;
        }
        if (self.periodicalInterval) {
            window.clearInterval(self.periodicalInterval);
            self.periodicalInterval = null;
            return;
        }

        if (App.active === null) {
            utils.status.show(navigator.mozL10n.get('no-active-remote-control'));
            return;
        }

        sendKey(key);
    });

    init();
});


Crafty.scene('Loading', function() {
    // Draw some text for the player to see in case files take a noticeable amount of time to load
    Crafty.e('2D, DOM, Text')
        .attr({
            x: 0,
            y: (App.sizes.height - 24) / 2 - 50,
            w: App.sizes.width
        })
        .text(navigator.mozL10n.get('loading'))
        .textColor('#FFFFFF')
        .textFont({size: '24px', weight: 'bold'})
        .css({'text-align': 'center'});

    // Load sprites images and sounds
    Crafty.load(
        {
            images: ['img/sprite-keys.png'],
            audio: {}
        },
        function() {
            // Once images are loaded...
            Crafty.sprite(90, 'img/sprite-keys.png', {
                keysSprite: [0, 0]
            });

            // Now that sprites are ready to draw, start to draw zap
            Crafty.scene('Zap');
        }
    );
});
