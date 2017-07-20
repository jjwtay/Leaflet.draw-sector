import './draw/handler/Draw.Sector'
import './edit/handler/Edit.Sector'

L.drawLocal.draw.toolbar.buttons.sector = 'Draw a Sector';

L.drawLocal.draw.handlers.sector = {
	tooltip: {
		start: 'Click to set Sector center.',
		line: 'Click to set Inner Radius and Start Bearing.',
		line2: 'Click to set OuterRadius.',
		end: 'Click to set End Bearing and create Arc'
	},
	radius: 'Radius (meters): ',
	bearing: 'Bearing (degrees): '
};