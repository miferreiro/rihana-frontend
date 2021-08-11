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

import {Component,EventEmitter,OnDestroy,OnInit,Output} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {Subscription} from 'rxjs';
import {getDocument, GlobalWorkerOptions, version} from 'pdfjs-dist';
import {PerformedExploration, Report, RequestedExploration} from '../../models/Report';
import {Patient, SEX} from '../../models/Patient';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

	@Output() reportEvent = new EventEmitter<Report>();

	private subscriptionReport: Subscription;

	public readonly controlReport = new FileUploadControl(
		{listVisible: true, accept: ['.pdf'], discardInvalid: true, multiple: false},
		[FileUploadValidators.accept(['.pdf']), FileUploadValidators.filesLimit(2)]
	);

	public report: Report = new Report();

	constructor() {
		GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;
	}

	ngOnInit(): void {
		this.report = new Report();
		this.subscriptionReport = this.controlReport.valueChanges.subscribe((values: Array<File>) => {
			if (values.length == 2) {
				this.controlReport.setValue([values[1]]);
			} else {
				this.report = new Report();
				this.loadReport(values[0])
			}
		});
	}

	public addFile(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}

		const file = input.files[0];
		this.controlReport.setValue([file]);
	}

	public removeFile(): void {
		this.controlReport.removeFile(this.controlReport.value[0])
		this.report = new Report();
		this.reportEvent.emit(this.report);
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
		const regexClinicalData = /(?:DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: EXPLORACIÓNS REALIZADAS)/;
		const regexPerformedExplorations = /(?:EXPLORACIÓNS REALIZADAS Código Descrición Data Portátil Quirófano )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+  \/  [0-9]+  \/  [0-9]+)   ([NS]) ([NS]) ?)+)(?: ACHADOS)/;
		const regexIndividualPerformedExplorations = /(([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+  \/  [0-9]+  \/  [0-9]+)   ([NS]) ([NS])(?: ?))/;
		const regexFindings = /(?:ACHADOS )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: CONCLUSIÓNS)/;
		const regexConclusions = /(?:CONCLUSIÓNS )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: RADIÓLOGO)/;
		const regexRadiologist = /(?:RADIÓLOGO\/A )([a-zA-Z0-9À-ÿÑñ.ºª -]+ )/;
		const regexPatient = /(?:Paciente: )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: Data Nac:)/;
		const regexBirthdate = /(?:Data Nac: )([0-9 ]+\/[0-9 ]+\/[0-9 ]+)(?: Sexo:)/;
		const regexSex = /(?:Sexo: )([a-zA-ZÀ-ÿÑñ]+)(?:  NHC:)/;
		const regexNHC = /(?:NHC: )([0-9]+)(?: CIP:)/;
		const regexCIP = /(?:CIP: )([0-9A-Z]+)(?: NSS:)/;
		const regexNSS = /(?:NSS: )([0-9\/]+)(?:  Enderezo:)/;
		const regexAddress = /(?:Enderezo: )([a-zA-Z0-9À-ÿÑñ.ºª ()-]+)(?: Teléfono:)/;
		const regexPhoneNumber = /(?:Teléfono: )([0-9]+)/;

		let patient = new Patient();

		let birthdateParts = report.match(regexBirthdate)[1].trim().replace(/[\t ]+/g, "").split("/");
		patient.birthdate = new Date(birthdateParts[2], birthdateParts[1] - 1, birthdateParts[0],);

		if (report.match(regexSex)[1] === 'Mujer') {
			patient.sex = SEX.FEMALE;
		} else {
			patient.sex = SEX.MALE;
		}

		this.report.patient = patient;

		let completionDateParts = report.match(regexCompletionDate)[1].trim().replace(/[\t ]+/g, "").split("/");
		this.report.completionDate = new Date(completionDateParts[2], completionDateParts[1] - 1, completionDateParts[0]);
		this.report.reportNumber = report.match(regexReportN)[1];
		this.report.applicant = report.match(regexApplicant)[1].trim().replace(/[\t ]+/g, " ");
		this.report.priority = report.match(regexPriority)[1];
		this.report.status = report.match(regexStatus)[1];
		this.report.bed = report.match(regexBed)[1];

		let splitRequestedExplorations = report.match(regexRequestedExplorations)[1]
												.trim()
												.split(regexIndividualRequestedExplorations)
												.filter(function (e: string) {return e != "";});
		let requestedExplorations: RequestedExploration[] = [];
		let numAttrReqExpl = 4;
		for (let i = 0; i < splitRequestedExplorations.length / numAttrReqExpl; i++) {
			let requestedExploration = new RequestedExploration();
			requestedExploration.code = splitRequestedExplorations[i * numAttrReqExpl + 1];
			requestedExploration.description = splitRequestedExplorations[i * numAttrReqExpl + 2];

			let completionDate = splitRequestedExplorations[i * numAttrReqExpl + 3].trim().replace(/[\t ]+/g, "").split("/");
			requestedExploration.date = new Date(completionDate[2], completionDate[1] - 1, completionDate[0]);

			requestedExplorations[i] = requestedExploration;
		}

		this.report.requestedExplorations = requestedExplorations;
		this.report.clinicalData = report.match(regexClinicalData)[1];

		let splitPerformedExplorations = report.match(regexPerformedExplorations)[1]
												.trim()
												.split(regexIndividualPerformedExplorations)
												.filter(function (e) {return e != "";});

		let performedExplorations: PerformedExploration[] = []
		let numAttrPerExpl = 6;
		for (let i = 0; i < splitPerformedExplorations.length / numAttrPerExpl; i++) {
			let performedExploration = new PerformedExploration();

			performedExploration.code = splitPerformedExplorations[i * numAttrPerExpl + 1];
			performedExploration.description = splitPerformedExplorations[i * numAttrPerExpl + 2];

			let completionDate = splitPerformedExplorations[i * numAttrReqExpl + 3].trim().replace(/[\t ]+/g, "").split("/");
			performedExploration.date = new Date(completionDate[2], completionDate[1] - 1, completionDate[0]);

			performedExploration.portable = splitPerformedExplorations[i * numAttrPerExpl + 4];
			performedExploration.surgery = splitPerformedExplorations[i * numAttrPerExpl + 5];

			performedExplorations[i] = performedExploration;
		}

		this.report.performedExplorations = performedExplorations;
		this.report.findings = report.match(regexFindings)[1];
		this.report.conclusions = report.match(regexConclusions)[1];

		this.reportEvent.emit(this.report);
	}

	private async getDocument(pdfBase64: string): Promise<string> {
		return getDocument({data: pdfBase64}).promise.then(function(pdf) {
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

	public expandReport() {
		if (document.getElementById("dataReport").className.includes("open")) {
			document.getElementById("dataReport").className = document.getElementById("dataReport").className.replace("open", "");
			document.getElementById("left-bar").className = document.getElementById("left-bar").className.replace("open", "");
			document.getElementById("right-bar").className = document.getElementById("right-bar").className.replace("open", "");
			document.getElementById("desc-fade").className = document.getElementById("desc-fade").className.replace("open", "");
		} else {
			document.getElementById("dataReport").className += "open";
			document.getElementById("left-bar").className += "open";
			document.getElementById("right-bar").className += "open";
			document.getElementById("desc-fade").className += "open";
		}
	}

	public ngOnDestroy(): void {
		this.subscriptionReport.unsubscribe();
	}
}
