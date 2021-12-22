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

import {Component, Input, OnInit} from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import {Observable} from 'rxjs';
import {NotificationService} from '../../../modules/notification/services/notification.service';
import {LocalizationService} from '../../../modules/internationalization/localization.service';
import {SignType} from '../../../models/SignType';
import {AuthenticationService} from '../../../services/authentication.service';
import {SignsService} from '../../../services/signs.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
	selector: 'app-pie-chart',
	templateUrl: './pie-chart.component.html',
	styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

	@Input() updateChart: Observable<void>;

	public loggedUser: string;

	public pieChartType: ChartType = 'pie';
	public pieChartLabels: Label[] = [];
	public pieChartData: number[] = [];
	public pieChartColors: any[] = [];
	public pieChartPlugins: any[] = [pluginDataLabels];

	public pieChartOptions: ChartOptions = {
		layout: {
            padding: {
				top: 20,
				bottom: 15
			}
        },
		legend: {
			align: 'center',
			display: true,
			fullWidth: false,
			labels: {
				padding: 20
			},
			onClick: function() {},
			position: 'bottom'
		},
		maintainAspectRatio: false,
		responsive: true,
		tooltips: {
			callbacks: {
				label: function (tooltipItems, data) {
					let array:number[] = [];
					data.datasets[0].data.forEach((x:any)=> array.push(x));
					let total = array.reduce((a, b) => a + b, 0);
					return " " + data.datasets[0].data[tooltipItems.index] +
					" (" +
					(Number.parseInt(data.datasets[0].data[tooltipItems.index].toString()) * 100 / total).toFixed(0) +
					' %)';
				}
			},
			enabled: true,
			mode: 'single'
		},
		animation: {
			onComplete: function(animation) {
			 	var firstSet = animation.chart.config.data.datasets[0].data;

				if (firstSet.length == 0) {
					document.getElementById('no-data-pie-chart').style.display = 'block';
					document.getElementById('no-data-pie-chart').style.opacity = '1';
					document.getElementById('no-data-pie-chart').style.visibility = 'visible';
					document.getElementById('pieChart').style.display = 'none'
				}
			}
		},
		plugins: {
			datalabels: {
				anchor: 'end',
				backgroundColor: function(context) {
					const setOpacity = (hex: string, alpha: number) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2)}`;
					const shadeColor = (color: string, percent: number) => {

						const percentChannel = (channel: number, percent: number) => {
							let C = Math.round(channel * (100 + percent) / 100);
							return (C < 255 ? C : 255);
						}
						const toHex = (channel: number) => `${((channel.toString(16).length == 1) ? "0" +
							channel.toString(16) : channel.toString(16))}`

						let R: number = parseInt(color.substring(1, 3), 16);
						let G: number = parseInt(color.substring(3, 5), 16);
						let B: number = parseInt(color.substring(5, 7), 16);

						return "#" + toHex(percentChannel(R, percent)) + toHex(percentChannel(G, percent)) +
							toHex(percentChannel(B, percent));
					}

					let color: string = context.dataset.backgroundColor[context.dataIndex];
					color = shadeColor(color, -30);
					return setOpacity(color.substring(0, context.dataset.backgroundColor[context.dataIndex].length - 2), 1);
				},
				borderColor: 'white',
				borderRadius: 25,
				borderWidth: 2,
				color: 'white',
				display: function(context) {

					let minPercentage = 10;

					var data = context.dataset.data;
					var value = Number.parseInt(data[context.dataIndex].toString());

					let array:number[] = [];
					data.forEach((x:any)=> array.push(x));
					let total = array.reduce((a, b) => a + b, 0);

					return (value / total) * 100 > minPercentage;
				},
				font: {
					weight: 'bold'
				},
				padding: 6,
				opacity: 1
			}
		}
	};

	constructor(private notificationService: NotificationService,
				private localizationService: LocalizationService,
				private authenticationService: AuthenticationService,
				private signsService: SignsService) { }

	ngOnInit(): void {

		if (this.authenticationService.getUser().authenticated) {
			this.loggedUser = this.authenticationService.getUser().login;
		}

		this.getSigns();
		this.updateChart.subscribe(() => this.getSigns());
	}

	private getSigns() {
		this.signsService.getSignsByUser(this.loggedUser).subscribe(signs => {

			let signTypes: SignType[] = [... new Map(signs.map(sign => [sign.type.code, sign.type])).values()];
			let signTypesLabels: string[] = [... new Set(signs.map(sign => sign.type.code))];

			let signNum: number[] = signTypes.map(
				signType => signs.filter(sign => sign.type.code === signType.code).length
			);

			const setOpacity = (hex: string, alpha: number) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2)}`;
			let signColors = signTypes.map(signType => setOpacity(signType.primaryColor, 0.8));

			this.pieChartLabels = signTypesLabels;
			this.pieChartData = signNum;
			this.pieChartColors = [{
				backgroundColor: signColors
			}];
		}, error => {
			this.notificationService.error(this.localizationService.translate("Error retrieving the user signs. Reason: ") + error.error,
										   "Failed to retrieve user signs");
		});
	}
}