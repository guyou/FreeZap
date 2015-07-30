/**
 * FreeZap
 *
 * written by Valéry Febvre
 * vfebvre@aester-eggs.com
 *
 * Copyright 2015 Valéry Febvre
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var App = {
    storage: Storage(),

    sizes: {
        rows: 7,
        cols: 5,
        width: null,
        height: null,
        key: {}
    },

    players: {
        hd1: 'Freebox Player 1',
        hd2: 'Freebox Player 2'
    },

    // Settings
    zaps: null,
    active: null,
    keysVibration: null,

    // Start app
    start: function() {
        App.zaps = App.storage.get('zaps') || [];
        App.active = App.storage.get('active');
        App.keysVibration = App.storage.get('keysVibration') || false;

        App.sizes.width = Math.min(window.innerHeight, window.innerWidth);
        App.sizes.height = Math.max(window.innerHeight, window.innerWidth) - $('#index header.fixed').height();
        App.sizes.key.width = App.sizes.width / App.sizes.cols;
        App.sizes.key.height = Math.min(App.sizes.key.width, App.sizes.height / App.sizes.rows);

        // about
        $('#btn-about').on('click', function () {
            $('#about').attr('class', 'current');
            $('[data-position="current"]').attr('class', 'right');
        });
        $('#btn-about-back').on('click', function () {
            $('#about').attr('class', 'left');
            $('[data-position="current"]').attr('class', 'rightToCurrent');
        });

        // settings
        $('#btn-settings').on('click', function () {
            $('#settings').attr('class', 'current');
            $('[data-position="current"]').attr('class', 'left');
        });
        $('#btn-settings-back').on('click', function () {
            $('#settings').attr('class', 'right');
            $('[data-position="current"]').attr('class', 'leftToCurrent');
        });
        $('#form-settings #keys-vibration').on('change', function () {
            App.keysVibration = $(this).is(':checked');
            App.storage.set('keysVibration', App.keysVibration);
        });

        // add zap
        $('#btn-zap-add').on('click', function () {
            document.getElementById('zap-edit-title').setAttribute('data-l10n-id', 'adding');
            $('#form-zap-edit #id').val('');
            $('#form-zap-edit').get(0).reset();
            $('#form-zap-edit #active').prop("checked", false);

            $('#zap-edit').attr('class', 'show');
        });

        // edit zap
        $('#btn-zap-edit-close').on('click', function () {
            $('#zap-edit').attr('class', 'hide');
        });
        $('#btn-zap-edit-save').on('click', function () {
            var id;

            id = $('#form-zap-edit #id').val();
            if (!id) {
                id = App.zaps.length;
            }
            else {
                id = parseInt(id, 10);
            }

            App.zaps[id] = {
                label: $('#form-zap-edit #label').val(),
                player: $('#form-zap-edit #player').val(),
                code: $('#form-zap-edit #code').val()
            };
            App.storage.set('zaps', App.zaps);

            if ($('#form-zap-edit #active').is(':checked')) {
                App.storage.set('active', id);
                App.active = id;
            }
            else {
                if (App.storage.get('active') === id) {
                    App.storage.remove('active');
                    App.active = null;
                }
            }

            App.updateZapsList();
            $('#zap-edit').attr('class', 'hide');
        });

        App.updateSettings();

        navigator.mozL10n.once(function() {
            Zap();
        });
    },
    
    updateSettings: function() {
        App.updateZapsList();

        $('#form-settings #keys-vibration').prop("checked", App.keysVibration);
    },

    updateZapsList: function() {
        var html = '';

        if (App.zaps.length > 0) {
            $.each(App.zaps, function(i, zap) {
                html += '<li>';
                html += '<aside class="pack-end">';
                html += '<a href="#" class="btn-zap-edit" data-id="' + i + '"><span data-icon="compose"></span></a>';
                html += '</aside>';
                html += '<p>' + zap.label + '</p>';
                html += '<p>' + App.players[zap.player];
                if (App.active === i) {
                    html += ' <span data-l10n-id="active" class="active">Active</span>';
                }
                html += '</p>';
                html += '</li>';
            });

            $('#settings #remote-controls').html(html);

            $('#settings .btn-zap-edit').on('click', function() {
                var id = parseInt($(this).data('id'), 10);

                document.getElementById('zap-edit-title').setAttribute('data-l10n-id', 'editing');
                $('#form-zap-edit #id').val(id);
                $('#form-zap-edit #label').val(App.zaps[id].label);
                $('#form-zap-edit #player').val(App.zaps[id].player);
                $('#form-zap-edit #code').val(App.zaps[id].code);
                $('#form-zap-edit #active').prop('checked', App.active === id);

                $('#zap-edit').attr('class', 'show');
            });
        }
        else {
            $('#settings #remote-controls').html(html);
        }
    }
};

function Storage() {
    function get(key) {
        try {
            return JSON.parse(window.localStorage.getItem(key));
        }
        catch (e) {
            return window.localStorage.getItem(key);
        }
    }

    function set(key, value) {
        var _value = value;

        if (typeof value === "object") {
            _value = JSON.stringify(value);
        }

        window.localStorage.setItem(key, _value);
    }

    function remove(key) {
        window.localStorage.removeItem(key);
    }

    return {
        get: get,
        set: set,
        remove: remove
    };
}

function Zap() {
    var renderer;
    var stage;
    var overshadow;

    var keyPressed;
    var keys = [
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

    var periodicalTimeout = null;
    var periodicalInterval = null;

    function init() {
        var loader;

        //renderer = new PIXI.autoDetectRenderer(App.sizes.width, App.sizes.height);
        renderer = new PIXI.CanvasRenderer(App.sizes.width, App.sizes.height);
        renderer.backgroundColor = 0x665C52;

        $('#index article').append($(renderer.view));

        loader = new PIXI.loaders.Loader();
        loader.add('keys', 'img/sprite-keys.png');
        loader.once('complete', build);
        loader.load();
    }

    function build(loader, resources) {
        var keysTexture = resources.keys.texture;
        var cropW = keysTexture.width / App.sizes.cols;
        var cropH = keysTexture.height / App.sizes.rows;

        stage = new PIXI.Container();
        stage.interactive = true;

        overshadow = new PIXI.Graphics();
        overshadow.beginFill(0x0000000);
        overshadow.drawRect(0, 0, App.sizes.key.width, App.sizes.key.height);
        overshadow.endFill();
        overshadow.visible = false;
        overshadow.alpha = 0.33;
        stage.addChild(overshadow);

        for(var i=0; i<App.sizes.cols; i++) {
            for(var j=0; j<App.sizes.rows; j++) {
                var cropX = i * cropW;
                var cropY = j * cropH;
                var keyTexture = new PIXI.Texture(keysTexture, new PIXI.Rectangle(cropX, cropY, cropW, cropH));
                var keySprite = new PIXI.Sprite(keyTexture);

                keySprite.fz_name = keys[j][i];
                keySprite.width = App.sizes.key.width;
                keySprite.height = App.sizes.key.height;
                keySprite.x = i * App.sizes.key.width;
                keySprite.y = j * App.sizes.key.height;
                keySprite.interactive = true;
                keySprite.mousedown = keySprite.touchstart = onKeyTouchStart;
                keySprite.mouseup = keySprite.touchend = onKeyTouchEnd;

                stage.addChild(keySprite);
            }
        }

        animate();
        
        function animate() {
            renderer.render(stage);
            window.requestAnimationFrame(animate);
        }
    }

    function onKeyTouchStart(data) {
        if (this.fz_name === null) {
            return;
        }

        keyPressed = this.fz_name;

        if (App.keysVibration) {
            window.navigator.vibrate(50);
        }

        if (this.fz_name === 'home') {
            overshadow.x = App.sizes.key.width;
            overshadow.y = this.y;
            overshadow.scale.x = 3;
        }
        else {
            overshadow.x = this.x;
            overshadow.y = this.y;
            overshadow.scale.x = 1;
        }
        overshadow.visible = true;

        if (this.fz_name === 'vol_dec' || this.fz_name === 'vol_inc' ||
            this.fz_name === 'left' || this.fz_name === 'right' ||
            this.fz_name === 'up' || this.fz_name === 'down') {
            periodicalTimeout = window.setTimeout(
                function() {
                    sendKeyPeriodically(
                        keyPressed,
                        keyPressed === 'vol_dec' || keyPressed === 'vol_inc' ? 50 : 150
                    );
                },
                500
            );
        }
    }

    function onKeyTouchEnd(data) {
        if (!keyPressed) {
            // null key pressed
            return;
        }

        if (periodicalInterval) {
            window.clearInterval(periodicalInterval);
            periodicalInterval = null;
        }
        if (periodicalTimeout) {
            window.clearTimeout(periodicalTimeout);
            periodicalTimeout = null;
        }

        overshadow.visible = false;

        if (this.fz_name === keyPressed) {
            if (App.active !== null) {
                sendKey(this.fz_name);
            }
            else {
                utils.status.show(navigator.mozL10n.get('no-active-remote-control'));
            }
        }

        keyPressed = null;
    }

    function sendKey(name) {
        var zap = App.zaps[App.active];
        var url = 'http://' + zap.player + '.freebox.fr/pub/remote_control?';
        url += $.param({
            code: zap.code,
            key: name,
            long: name === 'bwd' || name === 'fwd' ? true : false
        });

        var xhr = new XMLHttpRequest({mozSystem: true});
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (!navigator.onLine) {
                    utils.status.show(navigator.mozL10n.get('no-wifi-connection'));
                }
                else if (xhr.status !== 200) {
                    utils.status.show(navigator.mozL10n.get('invalid-remote-control-code'));
                }
            }
        };
        xhr.timeout = 1000;
        xhr.ontimeout = function () {
            utils.status.show(navigator.mozL10n.get('no-wifi-connection-or-invalid-remote-control-code'));
        }; 
        xhr.send();
    }

    function sendKeyPeriodically(name, msec) {
        if (App.active === null) {
            utils.status.show(navigator.mozL10n.get('no-active-remote-control'));
            return;
        }
        periodicalInterval = window.setInterval(
            function() {
                sendKey(name);
            },
            msec
        );
    }

    init();
}

window.addEventListener('load', App.start, false);
