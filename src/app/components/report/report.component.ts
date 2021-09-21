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

import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {Subscription} from 'rxjs';
import {getDocument, GlobalWorkerOptions, version} from 'pdfjs-dist';
import {PerformedExploration, Report, RequestedExploration} from '../../models/Report';
import {Patient, SEX} from '../../models/Patient';
import {NotificationService} from '../../modules/notification/services/notification.service';

@Component({
	selector: 'app-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

	private readonly extensionValid = ['pdf'];

	@Output() reportEvent = new EventEmitter<Report>();

	private subscriptionReport: Subscription;

	public readonly controlReport = new FileUploadControl(
		{listVisible: true, discardInvalid: true, multiple: false},
		[FileUploadValidators.filesLimit(2)]
	);

	public isReportLoaded: boolean;

	public report: Report = new Report();
	public patient: Patient = new Patient();

	constructor(private notificationService: NotificationService) {
		GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;
	}

	ngOnInit(): void {
		this.report = new Report();
		this.isReportLoaded = false;
		this.subscriptionReport = this.controlReport.valueChanges.subscribe((values: Array<File>) => {
			if (values.length == 2) {
				if (this.extensionValid.includes(values[1].name.split('.').pop())) {
					this.controlReport.setValue([values[1]]);
				} else {
					this.notificationService.error("The file does not have the correct extension (.pdf)", "File upload failed");
				}
			} else {
				if (values[0] != undefined) {
					if (this.extensionValid.includes(values[0].name.split('.').pop())) {
						this.report = new Report();
						this.loadReport(values[0])
					} else {
						this.notificationService.error("The file does not have the correct extension (.pdf)", "File upload failed");
						this.controlReport.setValue([]);
					}
				}
			}
		});
	}

	public addFile(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) {
			return;
		}

		const file = input.files[0];
		if (this.extensionValid.includes(file.name.split('.').pop())) {
			this.controlReport.setValue([file]);
		} else {
			this.notificationService.error("The file does not have the correct extension (.pdf)", "File upload failed");
		}

	}

	public removeReport(): void {
		this.controlReport.removeFile(this.controlReport.value[0])
		this.report = new Report();
		this.patient = new Patient();
		this.reportEvent.emit(this.report);
		this.isReportLoaded = false;
	}

	private loadReport(file: File): void {
		if (file != undefined) {
			let fr = new FileReader();
			fr.onload = async (e) => {
				var pdfBase64 = atob(fr.result.toString().split(',')[1]);
				let report = await this.getDocument(pdfBase64);
				this.loadFieldsReport(report);
				this.isReportLoaded = true;
				this.notificationService.success("The file has the correct format", "File upload successfull")
			}
			fr.readAsDataURL(file);
		}
	}

	public onPaste(event: Event): void {
		if (navigator.clipboard) {
			navigator.clipboard.readText()
				.then(text => {
					text = text.replace(/(\r\n|\n|\r)/gm, " ");
					this.loadFieldsReport(text);
					this.isReportLoaded = true;
				})
				.catch(error => {
					this.notificationService.error("The copied report has not the correct format", "Report loaded failed")
				});
		} else {
			this.notificationService.error("The clipboard is not enabled", "Failed to access the clipboard")
		}
	}

	private loadFieldsReport(report: any): void {

		report = report.replace(/\s+/g, " ");
		let dictRegex = {};

		dictRegex["regexBirthdate"] = /(?:Data Nac: )([0-9 ]+\/[0-9 ]+\/[0-9 ]+)(?: Sexo:)/;
		dictRegex["regexSex"] = /(?:Sexo: )([a-zA-ZÀ-ÿÑñ]+)(?: NHC:)/;
		dictRegex["regexCompetionDate"] = /(?:Data Realización )([0-9 ]+\/[0-9 ]+\/[0-9 ]+)/;
		dictRegex["regexReportN"] = /(?:Informe Nº )([0-9]+)/;
		dictRegex["regexApplicant"] = /(?:SOLICITANTE Centro\/Servizo )([[a-zA-Z0-9À-ÿÑñ.\/ -]+)(?: Médico)/;
		dictRegex["regexPriority"] = /(?:Prioridade )([a-zA-Z0-9À-ÿÑñ]+)(?: )/;
		dictRegex["regexBed"] = /(?:Cama )([a-zA-ZÀ-ÿÑñ0-9]+)/;
		dictRegex["regexStatus"] = /(?:Prioridade [a-zA-Z0-9À-ÿÑñ]+ )([a-zA-Z0-9À-ÿÑñ]+)(?: )/;
		dictRegex["regexRequestedExplorations"] = /(?:EXPLORACIÓNS SOLICITADAS Código Descrición Data )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+ \/ [0-9]+ \/ [0-9]+) ?)+)(?: DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE)/;
		dictRegex["regexIndividualRequestedExplorations"] = /(([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+ \/ [0-9]+ \/ [0-9]+)(?: ?))/;
		dictRegex["regexPerformedExplorations"] = /(?:EXPLORACIÓNS REALIZADAS Código Descrición Data Portátil Quirófano )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+ \/ [0-9]+ \/ [0-9]+) ([NS]) ([NS]) ?)+)(?: ACHADOS)/;
		dictRegex["regexIndividualPerformedExplorations"] = /(([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, ]+) ([0-9]+ \/ [0-9]+ \/ [0-9]+) ([NS]) ([NS])(?: ?))/;
		dictRegex["regexClinicalData"] = /(?:DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: EXPLORACIÓNS REALIZADAS)/;
		dictRegex["regexFindings"] = /(?:ACHADOS )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: CONCLUSIÓNS)/;
		dictRegex["regexConclusions"] = /(?:CONCLUSIÓNS )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: RADIÓLOGO)/;

		// const regexDoctor = /(?:Médico )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: PACIENTE)/;
		// const regexRadiologist = /(?:RADIÓLOGO\/A )([a-zA-Z0-9À-ÿÑñ.ºª -]+ )/;
		// const regexPatient = /(?:Paciente: )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: Data Nac:)/;
		// const regexNHC = /(?:NHC: )([0-9]+)(?: CIP:)/;
		// const regexCIP = /(?:CIP: )([0-9A-Z]+)(?: NSS:)/;
		// const regexNSS = /(?:NSS: )([0-9\/]+)(?:  Enderezo:)/;
		// const regexAddress = /(?:Enderezo: )([a-zA-Z0-9À-ÿÑñ.ºª ()-]+)(?: Teléfono:)/;
		// const regexPhoneNumber = /(?:Teléfono: )([0-9]+)/;

		this.patient = new Patient();

		let birthdateParts: RegExp = report.match(dictRegex["regexBirthdate"])[1].trim().replace(/[\t ]+/g, "").split("/");

		this.patient.birthdate = new Date(birthdateParts[2], birthdateParts[1] - 1, birthdateParts[0],);

		if (report.match(dictRegex["regexSex"])[1] === 'Mujer') {
			this.patient.sex = SEX.FEMALE;
		} else {
			this.patient.sex = SEX.MALE;
		}

		let completionDateParts = report.match(dictRegex["regexCompetionDate"])[1].trim().replace(/[\t ]+/g, "").split("/");
		this.report.completionDate = new Date(completionDateParts[2], completionDateParts[1] - 1, completionDateParts[0]);
		this.report.reportNumber = report.match(dictRegex["regexReportN"])[1];
		this.report.applicant = report.match(dictRegex["regexApplicant"])[1].trim().replace(/[\t ]+/g, " ");
		this.report.priority = report.match(dictRegex["regexPriority"])[1];
		this.report.status = report.match(dictRegex["regexStatus"])[1];
		this.report.bed = report.match(dictRegex["regexBed"])[1];

		let splitRequestedExplorations = report.match(dictRegex["regexRequestedExplorations"])[1]
			.trim()
			.split(dictRegex["regexIndividualRequestedExplorations"])
			.filter(function (e: string) { return e != ""; });
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
		this.report.clinicalData = report.match(dictRegex["regexClinicalData"])[1];

		let splitPerformedExplorations = report.match(dictRegex["regexPerformedExplorations"])[1]
			.trim()
			.split(dictRegex["regexIndividualPerformedExplorations"])
			.filter(function (e) { return e != ""; });

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
		this.report.findings = report.match(dictRegex["regexFindings"])[1];
		this.report.conclusions = report.match(dictRegex["regexConclusions"])[1];

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
			document.getElementById("dataReport").className = document.getElementById("dataReport").className.replace(" open", "");
			document.getElementById("expandControl").className = "bi bi-eye-slash";
		} else {
			document.getElementById("dataReport").className += " open";
			document.getElementById("expandControl").className = "bi bi-eye";
		}
	}

	public ngOnDestroy(): void {
		this.subscriptionReport.unsubscribe();
	}
}
