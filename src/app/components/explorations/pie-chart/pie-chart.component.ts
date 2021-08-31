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
import {ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';
import {AuthenticationService} from '../../../services/authentication.service';
import {assignColorTypeSign} from '../../../models/Sign';
import {SignsService} from '../../../services/signs.service';

@Component({
	selector: 'app-pie-chart',
	templateUrl: './pie-chart.component.html',
	styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

	public loggedUser: string;

	public pieChartType: ChartType = 'pie';
	public pieChartLabels: Label[] = [];
	public pieChartData: number[] = [];
	public pieChartColors: any[] = [];

	public pieChartOptions: ChartOptions = {
		legend: {
			align: 'center',
			display: true,
			position: 'bottom'
		},
		maintainAspectRatio: false,
		responsive: true,
		tooltips: {
			callbacks: {
				label: function (tooltipItems, data) {
					return data.datasets[0].data[tooltipItems.index] +
					" (" +
					(Number.parseInt(data.datasets[0].data[tooltipItems.index].toString()) * 100 / data.datasets[0].data.length).toFixed(0) +
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
		}
	};

	constructor(private authenticationService: AuthenticationService,
				private signsService: SignsService) { }

	ngOnInit(): void {

		if (this.authenticationService.getUser().authenticated) {
			this.loggedUser = this.authenticationService.getUser().login;
		}

		this.signsService.getSignsByUser(this.loggedUser).subscribe(signs => {

			let signTypes = [... new Set(signs.map(sign => sign.type))];
			let signTypesLabels = [... new Set(signs.map(sign => sign.type.substr(0, 3).toUpperCase()))];

			let signNum: number[] = signTypes.map(
				signType => signs.filter(sign => sign.type == signType).length
			);

			const setOpacity = (hex: string, alpha: number) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2)}`;
			let signColors = signTypes.map(signType => setOpacity(assignColorTypeSign(signType, false), 0.8))

			this.pieChartLabels = signTypesLabels;
			this.pieChartData = signNum;
			this.pieChartColors = [{
				backgroundColor: signColors
			}];
		});
	}
}