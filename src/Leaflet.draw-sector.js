import './draw/handler/Draw.Sector'
import './edit/handler/Edit.Sector'

L.drawLocal.draw.toolbar.buttons.sector = 'Draw a Sector'

L.drawLocal.draw.handlers.sector = {
    tooltip: {
        start: 'Click to set Sector center.',
        line: 'Click to set Inner Radius and Start Bearing.',
        end: 'Click to set End Bearing, Outer Radius and create Sector'
    },
    radius: 'Radius (meters): ',
    bearing: 'Bearing (degrees): '
}