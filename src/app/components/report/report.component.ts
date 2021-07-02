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

import {Component,OnDestroy,OnInit} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {Subscription} from 'rxjs';
import * as pdfjsLib from 'pdfjs-dist';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

	private subscriptionReport: Subscription;

	public readonly controlReport = new FileUploadControl(
		{listVisible: true, accept: ['.pdf'], discardInvalid: true, multiple: false},
		[FileUploadValidators.accept(['.pdf']), FileUploadValidators.filesLimit(1)]
	);
	public fieldsReport: { [key: string]: any } = {};

	constructor() {
		pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
	}

	ngOnInit(): void {
		this.fieldsReport = {};
		this.subscriptionReport = this.controlReport.valueChanges.subscribe((values: Array<File>) =>{this.fieldsReport = {}; this.loadReport(values[0]) });
	}

	public addFile(event: Event): void{
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}
		const file = input.files[0];
		this.controlReport.setValue([]);
		this.controlReport.addFile(file);
	}

	private loadReport(file: File): void {
		if (file != undefined) {
			let fr = new FileReader();
			fr.onload = async (e) => {
				var pdfBase64 = atob(fr.result.toString().split(',')[1]);
				let report = await this.getDocument(pdfBase64);
				this.loadFieldsReport(report);
			}
			fr.readAsDataURL(file);
		}
	}

	private loadFieldsReport(report: any):void {

		const regexCompletionDate = /(?:Data Realización )([0-9 ]+\/[0-9 ]+\/[0-9 ]+)/;
		const regexReportN = /(?:Informe Nº )([0-9]+)/;
		const regexApplicant = /(?:SOLICITANTE Centro\/Servizo )([[a-zA-Z0-9À-ÿÑñ.\/ -]+)(?: Médico)/;
		const regexDoctor = /(?:Médico )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: PACIENTE)/;
		const regexPriority = /(?:Prioridade )([a-zA-Z0-9À-ÿÑñ]+)(?: )/;
		const regexStatus = /(?:Prioridade [a-zA-Z0-9À-ÿÑñ]+ )([a-zA-Z0-9À-ÿÑñ]+)(?: )/;
		const regexBed = /(?:Cama )([a-zA-ZÀ-ÿÑñ0-9]+)/;
		const regexRequestedExplorations = /(?:EXPLORACIÓNS SOLICITADAS Código Descrición Data )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+  \/  [0-9]+  \/  [0-9]+) ?)+)(?:   DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE)/;
		const regexIndividualRequestedExplorations = /(([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+  \/  [0-9]+  \/  [0-9]+)(?: ?))/;
		const regexClinicalData = /(?:DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE)([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: EXPLORACIÓNS REALIZADAS)/;
		const regexPerformedExplorations = /(?:EXPLORACIÓNS REALIZADAS Código Descrición Data Portátil Quirófano )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+  \/  [0-9]+  \/  [0-9]+)   ([NS]) ([NS]) ?)+)(?: ACHADOS)/;
		const regexIndividualPerformedExplorations = /(([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+  \/  [0-9]+  \/  [0-9]+)   ([NS]) ([NS])(?: ?))/;
		const regexFindings = /(?:ACHADOS)([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: CONCLUSIÓNS)/;
		const regexConclusions = /(?:CONCLUSIÓNS)([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: RADIÓLOGO)/;
		const regexRadiologist = /(?:RADIÓLOGO\/A )([a-zA-Z0-9À-ÿÑñ.ºª -]+ )/;
		const regexPatient = /(?:Paciente: )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: Data Nac:)/;
		const regexBirthDate = /(?:Data Nac: )([0-9 ]+\/[0-9 ]+\/[0-9 ]+)(?: Sexo:)/;
		const regexGender = /(?:Sexo: )([a-zA-ZÀ-ÿÑñ]+)(?:  NHC:)/;
		const regexNHC = /(?:NHC: )([0-9]+)(?: CIP:)/;
		const regexCIP = /(?:CIP: )([0-9A-Z]+)(?: NSS:)/;
		const regexNSS = /(?:NSS: )([0-9\/]+)(?:  Enderezo:)/;
		const regexAddress = /(?:Enderezo: )([a-zA-Z0-9À-ÿÑñ.ºª ()-]+)(?: Teléfono:)/;
		const regexPhoneNumber = /(?:Teléfono: )([0-9]+)/;

		this.fieldsReport = {};
		this.fieldsReport.completionDate = report.match(regexCompletionDate)[1];
		this.fieldsReport.reportN = report.match(regexReportN)[1];
		this.fieldsReport.applicant = report.match(regexApplicant)[1];
		this.fieldsReport.priority = report.match(regexPriority)[1];
		this.fieldsReport.status = report.match(regexStatus)[1];
		this.fieldsReport.bed = report.match(regexBed)[1];

		let splitRequestedExplorations = report.match(regexRequestedExplorations)[1]
												.trim()
												.split(regexIndividualRequestedExplorations)
												.filter(function (e) {return e != "";});
		let requestedExplorations =  [];
		let numAttrReqExpl = 4;
		for (let i = 0; i < splitRequestedExplorations.length/numAttrReqExpl; i++) {
			requestedExplorations[i] = [];
			requestedExplorations[i].code = splitRequestedExplorations[i * numAttrReqExpl + 1];
			requestedExplorations[i].description = splitRequestedExplorations[i * numAttrReqExpl + 2];
			requestedExplorations[i].date = splitRequestedExplorations[i * numAttrReqExpl + 3];
		}

		this.fieldsReport.requestedExplorations = requestedExplorations;
		this.fieldsReport.clinicalData = report.match(regexClinicalData)[1];

		let splitPerformedExplorations = report.match(regexPerformedExplorations)[1]
												.trim()
												.split(regexIndividualPerformedExplorations)
												.filter(function (e) {return e != "";});

		let performedExplorations =  [];
		let numAttrPerExpl = 6;
		for (let i = 0; i < splitPerformedExplorations.length / numAttrPerExpl; i++) {
			performedExplorations[i] = [];
			performedExplorations[i].code = splitPerformedExplorations[i * numAttrPerExpl + 1];
			performedExplorations[i].description = splitPerformedExplorations[i * numAttrPerExpl + 2];
			performedExplorations[i].date = splitPerformedExplorations[i * numAttrPerExpl + 3];
			performedExplorations[i].portable = splitPerformedExplorations[i * numAttrPerExpl + 4];
			performedExplorations[i].surgery = splitPerformedExplorations[i * numAttrPerExpl + 5];
		}

		this.fieldsReport.performedExplorations = performedExplorations;
		this.fieldsReport.findings = report.match(regexFindings)[1];
		this.fieldsReport.conclusions = report.match(regexConclusions)[1];

		this.fieldsReport.birthDate = report.match(regexBirthDate)[1];
		this.fieldsReport.gender = report.match(regexGender)[1];
	}

	private getDocument(pdfBase64: string): Promise<string> {
		return pdfjsLib.getDocument({data: pdfBase64}).promise.then(function(pdf) {
			var maxPages = pdf.numPages;

			var countPromises = [];
			for (var j = 1; j <= maxPages; j++) {
				var page = pdf.getPage(j);

				countPromises.push(page.then(function(page) {
					var textContent = page.getTextContent();
					return textContent.then(function(text) {
						return text.items.map(function (s) { return s.str; }).join(' ');
					});
				}));
			}
			return Promise.all(countPromises).then(function(texts) {
				return texts.join('');
			});
		});
	}


	public ngOnDestroy(): void {
		this.subscriptionReport.unsubscribe();
	}

	/**
	 * Format bytes as human-readable text.
	 *
	 * @param bytes Number of bytes.
	 * @param dp Number of decimal places to display.
	 *
	 * @return Formatted string.
	 */
	public humanFileSize(bytes, dp = 2) {
		const thresh = 1024;

		if (Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}

		const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		let u = -1;
		const r = 10**dp;

		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

		return bytes.toFixed(dp) + ' ' + units[u];
	}
}
