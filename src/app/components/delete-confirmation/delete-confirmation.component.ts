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

import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent {

	private _open = false;

	// id that is used to delete the object
	@Input() id: string;
	// identifying name that will be shown
	@Input() name: string;
	// type of model to delete
	@Input() modelName: string;

	@Output() openChange = new EventEmitter<boolean>();

	@Output() confirm = new EventEmitter<string>();
	@Output() cancel = new EventEmitter<void>();

	@Input()
	public set open(open: boolean) {
		if (this._open !== open) {
			this._open = open;
			if (this._open) {
				document.getElementsByTagName("body")[0].style.overflow = "hidden";
			}
			this.openChange.emit(this._open);
		}
	}

	public get open(): boolean {
		return this._open;
	}

	public onConfirm(): void {
		document.getElementsByTagName("body")[0].style.overflow = "auto";
		this.confirm.emit(this.id);
		this.open = false;
	}

	public onCancel(): void {
		document.getElementsByTagName("body")[0].style.overflow = "auto";
		this.cancel.emit();
		this.open = false;
	}
}