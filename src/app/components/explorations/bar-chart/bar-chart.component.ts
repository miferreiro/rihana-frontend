/*
 * RIHANA Frontend
 *
 * Copyright (C) 2021-2022 David A. Ruano Ordás, José Ramón Méndez Reboredo,
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

import {Component, Input, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import {Observable} from 'rxjs';
import {NotificationService} from '../../../modules/notification/services/notification.service';
import {LocalizationService} from '../../../modules/internationalization/localization.service';
import {SignType} from '../../../models/SignType';
import {SignsService} from '../../../services/signs.service';

@Component({
	selector: 'app-bar-chart',
	templateUrl: './bar-chart.component.html',
	styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

	@Input() updateChart: Observable<void>;

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
		tooltips: {
			callbacks: {
				label: function (tooltipItems, data) {
					return " " + Number.parseInt(data.datasets[0].data[tooltipItems.index].toString()) + ' %';
				}
			},
			enabled: true,
			mode: 'single'
		},
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true,
					precision: 0,
					suggestedMax: 100
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

				var chartInstance = this.chart;
				var	ctx = chartInstance.ctx;
				ctx.font = '16px "Helvetica Neue", Helvetica, Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';

				this.data.datasets.forEach(function (dataset) {
					for (var i = 0; i < dataset.data.length; i++) {
						var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
						var scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
						var y_pos = model.y;
						if ((scale_max - model.y) / scale_max >= 0.9)
							y_pos = model.y + 20;
						else {
							y_pos = model.y - 2;
						}
						ctx.fillText(dataset.label.split(',')[i], model.x, y_pos);
					}
				});
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

				var chartInstance = this.chart;
				var	ctx = chartInstance.ctx;
				ctx.font = '16px "Helvetica Neue", Helvetica, Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';

				this.data.datasets.forEach(function (dataset) {
					for (var i = 0; i < dataset.data.length; i++) {
						var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
						var scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
						var y_pos = model.y;
						if ((scale_max - model.y) / scale_max >= 0.9)
							y_pos = model.y + 20;
						else {
							y_pos = model.y - 2;
						}
						ctx.fillText(dataset.label.split(',')[i], model.x, y_pos);
					}
				});
			}
		}
	};

	constructor(private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private signsService: SignsService) { }

	ngOnInit(): void {
		this.getSigns();
		this.updateChart.subscribe(() => this.getSigns());
	}

	private getSigns() {
		this.signsService.getSigns().subscribe(signs => {

			let signTypes: SignType[] = [... new Map(signs.map(sign => [sign.type.code, sign.type])).values()];
			let signTypesTarget: number[] = [... new Map(signTypes.map(signType => [signType.code, signType.target])).values()];
			let signTypesLabels: string[] = [... new Set(signs.map(sign => sign.type.code))];

			let signNum = signTypes.map(
				signType => signs.filter(sign => sign.type.code === signType.code).length
			);

			const setOpacity = (hex: string, alpha: number) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2)}`;
			let signColors = signTypes.map(signType => setOpacity(signType.primaryColor, 0.8))

			let signNumPercentages: number[] = signNum.map((n, i) => Math.ceil((n / signTypesTarget[i])));

			signTypesLabels = signTypesLabels.map((signTypLabel, i) => signTypLabel + ' (' + signTypesTarget[i] + ')')

			this.barChartLabels = signTypesLabels;

			this.barChartData = [{
				data: signNumPercentages,
				label: signNum.toString()
			}];
			this.barChartColors = [{
				backgroundColor: signColors
			}];
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the signs. Reason: ") +
										   this.localizationService.translate(error.error),
										   "Failed to retrieve signs");
		});
	}
}