/*
 * RIHANA Frontend
 *
 * Copyright (C) 2021 David A. Ruano Ordás, José Ramón Méndez Reboredo,
 * Miguel Ferreiro Díaz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 */

import {Component, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import {assignColorTypeSign} from '../../../models/Sign';
import {SignsService} from '../../../services/signs.service';

@Component({
	selector: 'app-bar-chart',
	templateUrl: './bar-chart.component.html',
	styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

	public barChartType: ChartType = 'bar';
	public barChartLabels: Label[] = [];
	public barChartData: ChartDataSets[] = [];
	public barChartColors: any[] = [];

	public barChartOptions: ChartOptions = {
		legend: {
			display: false
		},
		maintainAspectRatio: false,
		responsive: true,
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true,
					precision: 0
				}
			}]
		},
		animation: {
			onProgress: function(animation) {
				var firstSet = animation.chart.config.data.datasets[0].data;
				if (firstSet.length == 0) {
					document.getElementById('barChart').style.display = 'none';
				} else {
					document.getElementById('barChart').style.display = 'block';
				}
			},
			onComplete: function(animation) {
				var firstSet = animation.chart.config.data.datasets[0].data;

				if (firstSet.length == 0) {
					document.getElementById('no-data-bar-chart').style.display = 'block';
					document.getElementById('no-data-bar-chart').style.opacity = '1';
					document.getElementById('no-data-bar-chart').style.visibility = 'visible';
					document.getElementById('barChart').style.display = 'none';
				} else {
					document.getElementById('no-data-bar-chart').style.display = 'none';
					document.getElementById('no-data-bar-chart').style.opacity = '0';
					document.getElementById('no-data-bar-chart').style.visibility = 'hidden';
					document.getElementById('barChart').style.display = 'block';
				}
			}
		}
	};

	constructor(private signsService: SignsService) { }

	ngOnInit(): void {

		this.signsService.getSigns().subscribe(signs => {

			let signTypes = [... new Set(signs.map(sign => sign.type))];
			let signTypesLabels = [... new Set(signs.map(sign => sign.type.substr(0, 3).toUpperCase()))];

			let signNum: number[] = signTypes.map(
				signType => signs.filter(sign => sign.type == signType).length
			);

			const setOpacity = (hex: string, alpha: number) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2)}`;
			let signColors = signTypes.map(signType => setOpacity(assignColorTypeSign(signType, false), 0.8))

			this.barChartLabels = signTypesLabels;
			this.barChartData = [{
				data: signNum
			}];
			this.barChartColors = [{
				backgroundColor: signColors
			}];
		});
	}
}