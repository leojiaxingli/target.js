(function (global, document) {
    const presets = {
        WA6: [new RingInfo('#54B8CA', 'black', '1px', 5, 'black'),
            new RingInfo('#54B8CA', 'black', '1px', 6, 'black'),
            new RingInfo('red', 'black', '1px', 7, 'white'),
            new RingInfo('red', 'black', '1px', 8, 'white'),
            new RingInfo('yellow', 'black', '1px', 9, 'black'),
            new RingInfo('yellow', 'black', '1px', 10, 'black')],
        GUN: [new RingInfo('black', 'white', '1px', 7, 'white'),
            new RingInfo('black', 'white', '1px', 8, 'white'),
            new RingInfo('black', 'white', '1px', 9, 'white'),
            new RingInfo('black', 'white', '1px', 10, 'white')]
    }

    let settings = {
        ringHighlightColor: 'green',
        ringRadius: '50%',
        pinColor: 'orange',
        pinDiameter: 8,
        showGrouping: false,
        pinImage: null,
        pinImageWidth: 20,
        pinImageHeight: 20,
    }

    function Target(container) {
        this.rings = [];
        this.pins = [];
        this.container = container;
        this.hitCount = 0;
        this.ghostPin = new GhostPin(settings.pinDiameter);
    }

    Target.prototype = {
        createTarget: function (ringInfo) {
            let ringNum = ringInfo.length;
            this.container.style.gridTemplateColumns = `repeat(${ringNum * 2}, 1fr)`;
            this.container.style.gridTemplateRows = `repeat(${ringNum * 2}, 1fr)`;
            this.container.style.display = 'grid';
            this.container.style.position = 'relative';
            this.groupingCircle = new GroupingCircle();

            for (let i = 0; i < ringNum; i++) {
                let ring = new Ring(this, ringInfo[i], i, ringNum);
                this.container.appendChild(ring.get());
                this.rings.push(ring);
            }
            this.container.appendChild(this.groupingCircle.get());
            this.container.appendChild(this.ghostPin.get());
            this.hideGhost(true);
        },
        changeSettings: function (newSettings) {
            settings= {...settings, ...newSettings};
        },
        showGrouping: function (show) {
            settings.showGrouping = show;
            this.groupingCircle.get().hidden = !(settings.showGrouping && this.pins.length > 1);
        },
        addHitCallback: function (callback) {
            this.hitCallback = callback;
        },
        calculatePinPosition: function (left, top) {
            let rect = this.container.getBoundingClientRect();
            let newLeft = left - rect.left;
            let newTop = top - rect.top;
            return [newLeft, newTop];
        },
        addPin: function (newPin) {
            let position = this.calculatePinPosition(newPin.left, newPin.top);
            newPin.setPosition(position[0], position[1]);
            this.container.appendChild(newPin.get());
            newPin.center();
            this.hitCount++;
            this.pins.push(newPin);
            newPin.setIndex(this.pins.length);

            this.update();
        },
        moveGhost: function (x, y) {
            let position = this.calculatePinPosition(x, y);
            this.ghostPin.setPosition(position[0], position[1]);
            this.ghostPin.center();
        },
        hideGhost: function (hidden) {
            this.ghostPin.get().hidden = hidden;
        },
        pickup: function (index) {
            if (this.pinPickedUp) {
                return;
            }
            let pin = this.pins.find(x => x.index === index);
            pin.get().hidden = true;
            this.pinPickedUp = pin;
            this.ghostPin.set(index);
        },
        drop: function (score, x, y) {
            let position = this.calculatePinPosition(x, y);
            this.pinPickedUp.setPosition(position[0], position[1]);
            this.pinPickedUp.score = score;
            this.pinPickedUp.get().hidden = false;
            this.pinPickedUp.center();
            this.pinPickedUp = null;
            this.ghostPin.reset();

            this.update();
        },
        removePin: function (index) {
            if (this.pinPickedUp) {
                this.pinPickedUp.get().hidden = false;
                this.pinPickedUp = null;
                this.ghostPin.reset();
            }
            let removed = this.pins.splice(index - 1, 1);
            removed[0].get().remove();

            for (let i = 0; i < this.pins.length; i++) {
                let pin = this.pins[i];
                pin.setIndex(i + 1);
            }

            this.update();
        },
        clearPins: function () {
            for (let i = 0; i < this.pins.length; i++) {
                this.pins[i].get().remove();
            }
            this.pins = [];
            this.pinPickedUp = null;
            this.ghostPin.reset();

            this.update();
        },
        update: function () {
            this.updateGrouping();
            if (this.hitCallback) {
                this.hitCallback(this.pins);
            }
        },
        updateGrouping: function () {
            if (this.pins.length > 1) {
                this.groupingCircle.get().hidden = !settings.showGrouping;
                this.groupingCircle.setGrouping(this.pins);
            } else {
                this.groupingCircle.get().hidden = true;
                this.groupingCircle.setGrouping(this.pins);
            }
        }
    }


    class GroupingCircle {
        constructor() {
            this.left = 0;
            this.top = 0;
            this.diameter = 0;
            this.createHTMLElement();
        }

        createHTMLElement() {
            this.groupingElement = document.createElement('div');
            this.groupingElement.className += 'target-grouping';
            this.groupingElement.hidden = true;
        }

        setGrouping(pins) {
            let leftMost = undefined;
            let rightMost = undefined;
            let topMost = undefined;
            let bottomMost = undefined;
            for (let i = 0; i < pins.length; i++) {
                let pin = pins[i];
                if (leftMost === undefined) {
                    leftMost = pin.left;
                    rightMost = pin.left;
                    topMost = pin.top;
                    bottomMost = pin.top;
                } else {
                    leftMost = pin.left < leftMost ? pin.left : leftMost;
                    rightMost = pin.left > rightMost ? pin.left : rightMost;
                    topMost = pin.top < topMost ? pin.top : topMost;
                    bottomMost = pin.top > bottomMost ? pin.top : bottomMost;
                }
            }
            leftMost -= settings.pinDiameter * 2;
            rightMost += settings.pinDiameter;
            topMost -= settings.pinDiameter * 2;
            bottomMost += settings.pinDiameter;
            this.diameter = Math.sqrt(Math.pow(bottomMost - topMost, 2) + Math.pow(rightMost - leftMost, 2));
            let xMiddle = leftMost + (rightMost - leftMost) / 2;
            let yMiddle = topMost + (bottomMost - topMost) / 2;
            this.left = xMiddle - this.diameter / 2;
            this.top = yMiddle - this.diameter / 2;
            this.showGroupingCircle();
        }

        showGroupingCircle() {
            this.groupingElement.style.left = `${this.left}px`;
            this.groupingElement.style.top = `${this.top}px`;
            this.groupingElement.style.width = `${this.diameter}px`;
            this.groupingElement.style.height = `${this.diameter}px`;
        }

        get() {
            return this.groupingElement;
        }
    }

    function RingInfo(color, borderColor, borderWidth, score, scoreTextColor) {
        this.color = color;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.border = `${this.borderColor} ${this.borderWidth} solid`;
        this.score = score;
        this.scoreTextColor = scoreTextColor;
    }

    class Ring {
        constructor(target, ringInfo, order, ringNum) {
            this.target = target;
            this.color = ringInfo.color;
            this.score = ringInfo.score;
            this.border = ringInfo.border;
            this.order = order;
            this.ringNum = ringNum;
            this.scoreTextColor = ringInfo.scoreTextColor;
            this.createHTMLElement();
            this.setRing();
        }

        createHTMLElement() {
            this.circleElement = document.createElement('div');
            this.circleElement.className += 'target-ring';

            this.circleElement.innerText = this.score;
            this.circleElement.style.color = this.scoreTextColor;
        }

        setRing() {
            let spanStart = this.order + 1;
            let spanEnd = this.ringNum * 2 + 1 - this.order;
            this.circleElement.style.border = `${this.border}`;
            this.circleElement.style.borderRadius = settings.ringRadius;
            this.circleElement.style.backgroundColor = `${this.color}`;
            this.circleElement.style.gridArea = `${spanStart}/${spanStart}/${spanEnd}/${spanEnd}`;
            this.circleElement.addEventListener("mouseover", this.hover,);
            this.circleElement.addEventListener("mouseout", this.out);
            this.circleElement.addEventListener('mousedown', this.mousedown);
            this.circleElement.addEventListener('mousemove', this.mousemove);
            this.circleElement.addEventListener('mouseup', this.mouseup);
        }

        hover = event => {
            if (event.target !== event.currentTarget)
                return;
            event.target.style.backgroundColor = settings.ringHighlightColor;
        }

        out = event => {
            if (event.target !== event.currentTarget)
                return;
            event.target.style.backgroundColor = `${this.color}`;
            this.target.hideGhost(true);
        }

        mousedown = event => {
            if (event.target !== event.currentTarget)
                return;
            if (this.target.pinPickedUp) {
                this.target.drop(this.score, event.clientX, event.clientY);
            } else {
                let pin = new Pin(this.target, this.score, settings.pinDiameter, event.clientX, event.clientY);
                this.target.addPin(pin);
            }
        }
        mousemove = event => {
            if (event.target !== event.currentTarget)
                return;
            this.target.moveGhost(event.clientX, event.clientY);

            this.target.hideGhost(false);
        }
        mouseup = event => {
            if (event.target !== event.currentTarget)
                return;
            console.log('up')
        }

        get() {
            return this.circleElement;
        }
    }

    class Pin {
        constructor(target, score, diameter, left, top) {
            this.target = target;
            this.index = 0;
            this.score = score;
            this.width = 0;
            this.height = 0;
            this.diameter = diameter;
            this.setPosition(left, top);
            this.createHTMLElement();
        }

        createHTMLElement() {
            this.imageElement = document.createElement('img');
            this.imageElement.style.position = 'absolute';
            if (settings.pinImage) {
                this.imageElement.src = settings.pinImage;
            } else {
                this.imageElement.hidden = true;
            }

            this.textElement = document.createElement('span');
            this.textElement.style.pointerEvents = 'none';
            this.textElement.hidden = true;

            this.pinElement = document.createElement('div');
            this.pinElement.appendChild(this.imageElement);
            this.pinElement.appendChild(this.textElement);
            this.pinElement.className += "target-pin";

            this.pinElement.style.backgroundColor = settings.pinColor;
            this.pinElement.style.width = `${this.diameter}px`;
            this.pinElement.style.height = `${this.diameter}px`;


            this.imageElement.addEventListener("mouseover", this.hover,);
            this.imageElement.addEventListener("mouseout", this.out);
            this.imageElement.addEventListener("mousedown", this.mousedown);

            this.pinElement.addEventListener("mouseover", this.hover,);
            this.pinElement.addEventListener("mouseout", this.out);
            this.pinElement.addEventListener("mousedown", this.mousedown);
        }

        setPosition(left, top) {
            this.left = left;
            this.top = top;
        }

        center() {
            this.height = this.pinElement.getBoundingClientRect().height;
            this.width = this.pinElement.getBoundingClientRect().width;
            this.pinElement.style.left = `${this.left - this.width / 2}px`;
            this.pinElement.style.top = `${this.top - this.height / 2}px`;
        }

        setIndex(index) {
            this.index = index;
            this.textElement.innerText = index;
        }

        hover = event => {
            if (event.target !== event.currentTarget)
                return;
            this.pinElement.style.width = `${this.diameter * 4}px`;
            this.pinElement.style.height = `${this.diameter * 4}px`;

            this.imageElement.style.width = `${settings.pinImageWidth * 1.5}px`;
            this.imageElement.style.height = `${settings.pinImageHeight * 1.5}px`;
            this.center();

            this.textElement.hidden = false;
        }

        out = event => {
            if (event.target !== event.currentTarget)
                return;
            this.pinElement.style.backgroundColor = settings.pinColor;
            this.pinElement.style.width = `${this.diameter}px`;
            this.pinElement.style.height = `${this.diameter}px`;

            this.imageElement.style.width = `${settings.pinImageWidth}px`;
            this.imageElement.style.height = `${settings.pinImageHeight}px`;
            this.center();
            this.textElement.hidden = true;
        }
        mousedown = event => {
            if (event.target !== event.currentTarget)
                return;
            this.target.pickup(this.index);

        }

        get() {
            return this.pinElement;
        }
    }

    class GhostPin {
        constructor(diameter) {
            this.width = 0;
            this.height = 0;
            this.diameter = diameter;
            this.createHTMLElement();
            this.textElement = document.createElement('span');
            this.textElement.style.pointerEvents = 'none';
            this.textElement.hidden = true;
            this.get().appendChild(this.textElement);
        }

        createHTMLElement() {
            this.pinElement = document.createElement('div');
            this.pinElement.className += "target-ghost-pin";

            this.pinElement.style.width = `${this.diameter}px`;
            this.pinElement.style.height = `${this.diameter}px`;
        }

        setPosition(left, top) {
            this.left = left;
            this.top = top;
        }

        center() {
            this.height = this.pinElement.getBoundingClientRect().height;
            this.width = this.pinElement.getBoundingClientRect().width;
            this.pinElement.style.left = `${this.left - this.width / 2}px`;
            this.pinElement.style.top = `${this.top - this.height / 2}px`;
        }

        set(index) {
            this.pinElement.style.width = `${this.diameter * 4}px`;
            this.pinElement.style.height = `${this.diameter * 4}px`;
            this.center();
            this.textElement.innerText = index;
            this.textElement.hidden = false;
        }

        reset() {
            this.pinElement.style.width = `${this.diameter}px`;
            this.pinElement.style.height = `${this.diameter}px`;
            this.center();
            this.textElement.hidden = true;
        }

        get() {
            return this.pinElement;
        }
    }

    global.Target = global.Target || Target;
    global.RingInfo = global.RingInfo || RingInfo;
    global.presets = global.presets || presets;
})(window, window.document);
