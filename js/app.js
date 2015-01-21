var App = {
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
    zaps: Crafty.storage('zaps') || [],
    active: Crafty.storage('active'),
    keysVibration: Crafty.storage('keysVibration') || false,
    
    // Initialize and start app
    start: function() {
        App.sizes.width = Math.min(window.innerHeight, window.innerWidth);
        App.sizes.height = Math.max(window.innerHeight, window.innerWidth) - $('#index header.fixed').height();
        App.sizes.key.width = App.sizes.width / App.sizes.cols;
        App.sizes.key.height = Math.min(App.sizes.key.width, App.sizes.height / App.sizes.rows);

        Crafty.init(App.sizes.width, App.sizes.height, 'zap');
        Crafty.background('#665c52');
        $('#index').on("animationend wekitAnimationEnd", function(event) {
            Crafty.viewport.reload();
        });

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
            Crafty.storage('keysVibration', App.keysVibration);
        });

        // add zap
        $('#btn-zap-add').on('click', function () {
            document.getElementById('zap-edit-title').setAttribute('data-l10n-id', 'adding');
            $('#form-zap-edit #id').val('');
            $('#form-zap-edit').get(0).reset();
            $('#form-zap-edit #active').prop("checked", false);

            $('#zap-edit').attr('class', 'current');
        });

        // edit zap
        $('#btn-zap-edit-close').on('click', function () {
            $('#zap-edit').attr('class', 'right');
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
            Crafty.storage('zaps', App.zaps);

            if ($('#form-zap-edit #active').is(':checked')) {
                Crafty.storage('active', id);
                App.active = id;
            }
            else {
                if (Crafty.storage('active') === id) {
                    Crafty.storage.remove('active');
                    App.active = null;
                }
            }

            App.updateZapsList();
            $('#zap-edit').attr('class', 'right');
        });

        App.updateSettings();

        navigator.mozL10n.once(function() {
            Crafty.scene('Loading');
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

                $('#zap-edit').attr('class', 'current');
            });
        }
        else {
            $('#settings #remote-controls').html(html);
        }
    }
};

window.addEventListener('load', App.start, false);
