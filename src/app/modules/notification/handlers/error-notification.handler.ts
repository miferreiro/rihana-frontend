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

import {ErrorHandler, Injectable} from '@angular/core';
import {NotificationService} from '../services/notification.service';
import {HttpErrorResponse} from '@angular/common/http';
import {RihanaError} from '../entities';

@Injectable()
export class ErrorNotificationHandler implements ErrorHandler {
	constructor(
		private notificationService: NotificationService
		) {
		}

	public handleError(error: Error | RihanaError | HttpErrorResponse): void {
		if (console) {
			console.log(error);
		}

		if (error instanceof RihanaError) {
			console.log('CAUSE', error.cause);
			this.notificationService.error(error.detail, error.summary);
		} else if (error instanceof HttpErrorResponse) {
			this.notificationService.error(error.error, error.statusText);
		}
	}
}