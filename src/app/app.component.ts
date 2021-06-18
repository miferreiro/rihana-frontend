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
import {NotificationService} from './modules/notification/services/notification.service';
import {NotificationsService} from 'angular2-notifications';
import {Severity} from './modules/notification/entities';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'RIHANA';

	constructor(
		private notificationService: NotificationService,
		private notificationsService: NotificationsService
	) {
	}

	ngOnInit() {
		this.notificationService.getMessages().subscribe(
			message => {
				switch (message.severity) {
					case Severity.ERROR:
						this.notificationsService.error(message.summary, message.detail);
						break;
					case Severity.SUCCESS:
						this.notificationsService.success(message.summary, message.detail);
						break;
					case Severity.INFO:
						this.notificationsService.info(message.summary, message.detail);
						break;
					case Severity.WARNING:
						this.notificationsService.warn(message.summary, message.detail);
						break;
				}
			}
		);
	}
}