
window.ImageClipboard = function (selector, callback) {
    'use strict';

    var self = typeof this === 'object' ? this : {};
    self.el = null;
    self.pasteCatcher = null;
    self.clipImage = null;
    self.onpaste = null;
    self.browserSupport = true;

    self.init = function (selector, callback) {

        self.pasteCatcher = null;
        self.clipImage = null;

        self.onpaste = typeof callback === 'function' ? callback : function () { };

        //pasting not supported, make workaround
        if (!window.Clipboard) {
            self.pasteCatcher = _makePasteCatcher();
        }

        window.addEventListener('paste', self.pasteHandler);

        return self;
    };

    self.pasteHandler = function (e) {
        var items;

        if (e.clipboardData && e.clipboardData.items) {
            items = e.clipboardData.items;

            if (items) {
                items = Array.prototype.filter.call(items, function (element) {
                    return element.type.indexOf("image") >= 0;
                });

                Array.prototype.forEach.call(items, function (item) {
                    var blob = item.getAsFile();

                    var rdr = new FileReader();
                    rdr.onloadend = function () {
                        _loadImage(rdr.result);
                    };

                    rdr.readAsDataURL(blob);
                });
            }
        }
        else if (self.pasteCatcher) {
            //no direct access to clipboardData (firefox)
            //use the pastecatcher
            setTimeout(function () {

                var child = self.pasteCatcher.firstElementChild;

                if (child && child.tagName == "IMG") {
                    _loadImage(child.src);
                }

            }, 5);
        }
    };

    function _makePasteCatcher() {
        var pasteBox = document.createElement("div");

        pasteBox.setAttribute("id", "paste_catcher");
        pasteBox.setAttribute("contenteditable", "");
        pasteBox.style.opacity = 0;
        pasteBox.style.height = 0;

        document.body.insertBefore(pasteBox, document.body.firstChild);

        pasteBox.focus();

        return pasteBox;
    }

    function _loadImage(source) {
        self.onpaste.call(self, source.split(",")[1]); //callback(base64, file-type)
    }

    function _isElement(obj) {
        return typeof HTMLElement === "object" ? obj instanceof HTMLElement :
          obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
    }

    return self.init(selector, callback);
};

export default {}