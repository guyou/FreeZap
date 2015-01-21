// Key of the remote control
Crafty.c('Key', {
    coords: null,

    init: function() {
        this.requires('2D, Canvas, Mouse, Sprite, keysSprite')
            .bind('MouseDown', this._onMouseDown)
            .bind('MouseOut', this._onMouseOut)
            .bind('MouseUp', this._onMouseUp);
    },

    key: function(x, y, dx, dy) {
        this.coords = {x: x, y: y};
        return this.crop(x * 90, y * 90, dx * 90, dy * 90)
            .attr({
                x: x * App.sizes.key.width,
                y: y * App.sizes.key.height,
                w: App.sizes.key.width * dx,
                h: App.sizes.key.height * dy
            });
    },

    _onMouseDown: function(e) {
        if (e.timeStamp === 0) {
            // bad event WTF
            return;
        }
        this.pressed = true;
        Crafty.trigger('KeyTouchDown', this);
    },

    _onMouseOut: function(e) {
        if (!this.pressed) {
            return;
        }
        Crafty.trigger('KeyTouchOut', this);
        this.pressed = false;
    },

    _onMouseUp: function(e) {
        if (!this.pressed || e.timeStamp === 0) {
            // bad event WTF
            return;
        }
        Crafty.trigger('KeyTouchUp', this);
        this.pressed = false;
    }
});

Crafty.c('Overshadow', {
    init: function() {
        this.requires('2D, Canvas, Color')
            .color('#000000', 0.33);
    },

    show: function(x, y, dx, dy) {
        this.attr({
            x: x * App.sizes.key.width,
            y: y * App.sizes.key.height,
            w: App.sizes.key.width * dx,
            h: App.sizes.key.height * dy
        });
        this.visible = true;
    },

    hide: function() {
        this.visible = false;
    }
});
