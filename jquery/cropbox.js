"use strict";
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var cropbox = function(options, el) {
        var el = el || $(options.imageBox),
            obj = {
                state: {},
                ratio: 1,
                options: options,
                imageBox: el,
                thumbBox: el.find(options.thumbBox),
                spinner: el.find(options.spinner),
                image: new Image(),
                getDataURL: function() {
                    var width = this.thumbBox.width(),
                        height = this.thumbBox.height(),
                        canvas = document.createElement("canvas"),
                        dim = el.css('background-position').split(' '),
                        size = el.css('background-size').split(' '),
                        dx = parseInt(dim[0]) - el.width() / 2 + width / 2,
                        dy = parseInt(dim[1]) - el.height() / 2 + height / 2,
                        dw = parseInt(size[0]),
                        dh = parseInt(size[1]),
                        sh = parseInt(this.image.height),
                        sw = parseInt(this.image.width);

                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext("2d");
                    context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                    var imageData = canvas.toDataURL('image/png');
                    return imageData;
                },
                getBlob: function() {
                    var imageData = this.getDataURL();
                    var b64 = imageData.replace('data:image/png;base64,', '');
                    var binary = atob(b64);
                    var array = [];
                    for (var i = 0; i < binary.length; i++) {
                        array.push(binary.charCodeAt(i));
                    }
                    return new Blob([new Uint8Array(array)], {
                        type: 'image/png'
                    });
                },
                zoomIn: function() {
                    this.ratio *= 1.1;
                    setBackground();
                },
                zoomOut: function() {
                    this.ratio *= 0.9;
                    setBackground();
                },
                changeSize: function(persent) {
                    this.ratio = (1.0 + persent);
                    setBackground();
                }
            },
            setBackground = function() {
                var w = parseInt(obj.image.width) * obj.ratio;
                var h = parseInt(obj.image.height) * obj.ratio;

                var pw = (el.width() - w) / 2;
                var ph = (el.height() - h) / 2;

                el.css({
                    'background-image': 'url(' + obj.image.src + ')',
                    'background-size': w + 'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'
                });
            },
            imgMouseDown = function(e) {
                e.stopImmediatePropagation();

                obj.state.dragable = true;
                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            },
            imgMouseMove = function(e) {
                e.stopImmediatePropagation();

                if (obj.state.dragable) {
                    var x = e.clientX - obj.state.mouseX;
                    var y = e.clientY - obj.state.mouseY;

                    var bg = el.css('background-position').split(' ');

                    var bgX = x + parseInt(bg[0]);
                    var bgY = y + parseInt(bg[1]);

                    el.css('background-position', bgX + 'px ' + bgY + 'px');

                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                }
            },
            imgMouseUp = function(e) {
                e.stopImmediatePropagation();
                obj.state.dragable = false;
            },
            zoomImage = function(e) {
                e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio *= 1.1 : obj.ratio *= 0.9;
                setBackground();
            },
            touchHandler = function(event)
            {
                var touches = event.changedTouches,
                    first = touches[0],
                    type = "";
                switch(event.type)
                {
                    case "touchstart": type = "mousedown"; break;
                    case "touchmove":  type = "mousemove"; break;
                    case "touchend":   type = "mouseup";   break;
                    default:           return;
                }

                var simulatedEvent = document.createEvent("MouseEvent");
                simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                              first.screenX, first.screenY,
                                              first.clientX, first.clientY, false,
                                              false, false, false, 0/*left*/, null);

                first.target.dispatchEvent(simulatedEvent);
                event.preventDefault();
            }

        obj.spinner.show();
        obj.image.onload = function() {
            obj.spinner.hide();
            setBackground();

            el.unbind('mousedown');
            el.unbind('mousemove');
            $(window).unbind('mouseup');
            el.unbind('mousewheel DOMMouseScroll');

            el.bind('mousedown', imgMouseDown);
            el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
            el.bind('mousewheel DOMMouseScroll', zoomImage);

            el[0].removeEventListener("touchstart", touchHandler, true);
            el[0].removeEventListener("touchmove", touchHandler, true);
            el[0].removeEventListener("touchend", touchHandler, true);
            el[0].removeEventListener("touchcancel", touchHandler, true);

            el[0].addEventListener("touchstart", touchHandler, true);
            el[0].addEventListener("touchmove", touchHandler, true);
            el[0].addEventListener("touchend", touchHandler, true);
            el[0].addEventListener("touchcancel", touchHandler, true);
        };
        obj.image.src = options.imgSrc;
        el.on('remove', function() {
            $(window).unbind('mouseup', imgMouseUp)
        });

        return obj;
    };

    jQuery.fn.cropbox = function(options) {
        return new cropbox(options, this);
    };
}));



