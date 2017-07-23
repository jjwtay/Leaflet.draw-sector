//L.Draw.Arc = L.Draw.SimpleShape.extend({
L.Draw.Sector = L.Draw.Feature.extend({
    statics: {
        TYPE: 'sector'
    },

    options: {
        shapeOptions: {
            stroke: true,
            color: '#ffff00',
            weight: 5,
            opacity: 0.5,
            //fill: true,
            //fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: true
        },
        showRadius: true,
        metric: true, // Whether to use the metric measurement system or imperial
        lineOptions: {
            color: '#ffff00',
            weight: 5,
            dashArray: '5, 10'
        }
    },

    initialize (map, options) {
        if (options && options.shapeOptions) {
            options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions)
        }
        if (options && options.lineOptions) {
            options.lineOptions = L.Util.extend({}, this.options.lineOptions, options.lineOptions)
        }

        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Sector.TYPE

        this._initialLabelText = L.drawLocal.draw.handlers.sector.tooltip.start

        L.Draw.Feature.prototype.initialize.call(this, map, options)
    },

    _drawShape (latlng) {
        //if (this._map.hasLayer(this._line)) this._map.removeLayer(this._line)
        const radius = Math.max(this._startLatLng.distanceTo(latlng), 10)

        let pc, ph, v, startBearing, endBearing

        if (!this._shape) {

            pc = this._map.project(this._startLatLng)
            ph = this._map.project(latlng)
            v = [ph.x - pc.x, ph.y - pc.y]

            startBearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360

            this._shape = L.sector({
                center: this._startLatLng,
                innerRadius: this._innerRadius,
                outerRadius: radius,
                startBearing,
                endBearing: startBearing + 1,
                ...this.options.shapeOptions
            })
            this._map.addLayer(this._shape)
        } else {
            pc = this._map.project(this._startLatLng)
            ph = this._map.project(latlng)
            v = [ph.x - pc.x, ph.y - pc.y]

            endBearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360

            this._shape.setOuterRadius(radius)
            this._shape.setEndBearing(endBearing)
            this._shape.setLatLngs(this._shape.getLatLngs())
        }
    },

    _drawLine (latlng) {
        if (!this._line) {
            this._line = L.polyline([this._startLatLng, latlng], this.options.lineOptions)
            this._map.addLayer(this._line)
        } else {
            this._line.setLatLngs([this._startLatLng, latlng])
        }

    },

    _fireCreatedEvent () {
        const sector = L.sector({
            ...this.options.shapeOptions,
            center: this._startLatLng,
            innerRadius: this._shape.getInnerRadius(),
            outerRadius: this._shape.getOuterRadius(),
            startBearing: this._shape.getStartBearing(),
            endBearing: this._shape.getEndBearing()
        })

        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, sector)
    },

    _onMouseMove (e) {
        const latlng = e.latlng

        let radius, pc, ph, v, bearing

        this._tooltip.updatePosition(latlng)

        if (this._isDrawing) {
            if (this._innerRadius) {
                this._drawShape(latlng)

                pc = this._map.project(this._startLatLng)
                ph = this._map.project(latlng)

                v = [ph.x - pc.x, ph.y - pc.y]

                bearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360

                this._tooltip.updateContent({
                    text: L.drawLocal.draw.handlers.sector.tooltip.end,
                    subtext: `Bearing(degrees): ${bearing}`
                })

            } else {
                radius = this._startLatLng.distanceTo(latlng)
                pc = this._map.project(this._startLatLng)
                ph = this._map.project(latlng)
                v = [ph.x - pc.x, ph.y - pc.y]

                bearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360

                this._drawLine(latlng)
                this._tooltip.updateContent({
                    text: L.drawLocal.draw.handlers.sector.tooltip.line,
                    subtext: `Radius(meters): ${radius}, Bearing(degrees): ${bearing}`
                })
            }
        }
    },

    _onMouseDown (e) {
        const latlng = e.latlng,
            pc = this._map.project(this._startLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],
            newB = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360

        this._isDrawing = true

        if (!this._startLatLng) {

            this._startLatLng = latlng
            /*L.DomEvent
				.on(document, 'mouseup', this._onMouseUp, this)
				.on(document, 'touchend', this._onMouseUp, this)
				.preventDefault(e.originalEvent);*/
        } else if (!this._innerRadius) {
            this._startBearing = newB
            this._innerRadius = this._startLatLng.distanceTo(latlng)
        } else {
            this._endBearing = newB
        }
    },

    _onMouseUp (e) {
        if (this._endBearing) {
            this._fireCreatedEvent(e)

            this.disable()

            if (this.options.repeatMode) {
                this.enable()
            }
        }
    },
    // @method addHooks(): void
    // Add listener hooks to this handler.
    addHooks () {
        L.Draw.Feature.prototype.addHooks.call(this)
        if (this._map) {
            this._mapDraggable = this._map.dragging.enabled()

            if (this._mapDraggable) {
                this._map.dragging.disable()
            }

            //TODO refactor: move cursor to styles
            this._container.style.cursor = 'crosshair'

            this._tooltip.updateContent({ text: this._initialLabelText })

            this._map
                .on('mousedown', this._onMouseDown, this)
                .on('mousemove', this._onMouseMove, this)
                .on('mouseup', this._onMouseUp, this)
            //.on('touchstart', this._onMouseDown, this)
            //.on('touchmove', this._onMouseMove, this);
        }
    },
    // @method removeHooks(): void
    // Remove listener hooks from this handler.
    removeHooks () {
        //L.Draw.Feature.prototype.removeHooks.call(this);
        if (this._map) {
            if (this._mapDraggable) {
                this._map.dragging.enable()
            }

            //TODO refactor: move cursor to styles
            this._container.style.cursor = ''

            this._map
                .off('mousedown', this._onMouseDown, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mouseup', this._onMouseUp, this)
            //.off('touchstart', this._onMouseDown, this)
            //.off('touchmove', this._onMouseMove, this);

            L.DomEvent.off(document, 'mouseup', this._onMouseUp, this)
            //L.DomEvent.off(document, 'touchend', this._onMouseUp, this);

            // If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
            if (this._shape) {
                this._map.removeLayer(this._shape)
                delete this._shape
            }
            if (this._line) {
                this._map.removeLayer(this._line)
                delete this._line
            }
        }
        this._isDrawing = false
    },
})