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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {Subscription} from 'rxjs';
import {getDocument, GlobalWorkerOptions, version} from 'pdfjs-dist';
import {PerformedExploration, Report, RequestedExploration} from '../../models/Report';
import {Patient, SEX} from '../../models/Patient';
import {ExplorationsService} from '../../services/explorations.service';
import {ReportsService} from '../../services/reports.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {LocalizationService} from '../../modules/internationalization/localization.service';
import {EnumUtils} from '../../utils/enum.utils';

export class ReportResult {
	readonly report: Report;
	readonly patient: Patient;
}

export enum STATE {
	NOT_LOADED = "NOT_LOADED",
	FILE_LOADED = "FILE_LOADED",
	CLIPBOARD_LOADED = "CLIPBOARD_LOADED",
	EXPLORATION_LOADED = "EXPLORATION_LOADED",
	READ_ONLY = "READ_ONLY"
}

@Component({
	selector: 'app-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {

	@Input() exploration;
	@Input() isEditing: boolean;

	@Output() reportEvent = new EventEmitter<ReportResult>();

	private readonly extensionValid = ['pdf'];
	public readonly controlReport = new FileUploadControl(
		{listVisible: true, discardInvalid: true, multiple: false},
		[FileUploadValidators.filesLimit(2)]
	);
	public readonly formatDateEs: string = 'dd/MM/yyyy';
	public readonly formatDateEn: string = 'MM/dd/yyyy';
	public currentFormatDate: string = 'dd/MM/yyyy';
	public STATEValues: STATE[];
	public state: STATE = STATE.NOT_LOADED;
	public report: Report;
	public patient: Patient;

	public sexes = SEX;
	public keys = Object.keys; 	// to show the value of the enum

	public options: any = {
		autoApply: false,
		alwaysShowCalendars: true,
		applyButtonClasses: "btn-primary applyDate",
		buttonClasses: "btn btn-sm",
		cancelClass: "btn-default cancelDate",
		drops: "up",
		locale: {
			format: 'DD/MM/yyyy',
			daysOfWeek: [
				this.localizationService.translate("Sunday").substr(0, 2),
				this.localizationService.translate("Monday").substr(0, 2),
				this.localizationService.translate("Tuesday").substr(0, 2),
				this.localizationService.translate("Wednesday").substr(0, 2),
				this.localizationService.translate("Thursday").substr(0, 2),
				this.localizationService.translate("Friday").substr(0, 2),
				this.localizationService.translate("Saturday").substr(0, 2)
			],
			monthNames: [
				this.localizationService.translate("January"),
				this.localizationService.translate("February"),
				this.localizationService.translate("March"),
				this.localizationService.translate("April"),
				this.localizationService.translate("May"),
				this.localizationService.translate("June"),
				this.localizationService.translate("July"),
				this.localizationService.translate("August"),
				this.localizationService.translate("September"),
				this.localizationService.translate("October"),
				this.localizationService.translate("November"),
				this.localizationService.translate("December")
			],
			"firstDay": 1
		},
		minDate: '01/01/1900',
		maxDate: new Date(),
		opens: 'left',
		showDropdowns: true,
		singleDatePicker: true,
		timePicker: false
	};

	private subscriptionReport: Subscription;
	private baseReport: Report;

	constructor(private explorationsService: ExplorationsService,
				private reportsService: ReportsService,
				private localizationService: LocalizationService,
				private notificationService: NotificationService) {
		GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;
	}

	ngOnInit(): void {

		if (this.localizationService.getCurrentLocaleId() === 'en') {
			this.currentFormatDate = this.formatDateEn;
		} else {
			this.currentFormatDate = this.formatDateEs;
		}

		this.STATEValues = EnumUtils.enumValues(STATE);

		if (this.exploration.title != undefined && this.exploration.report != null) {
			this.baseReport = this.report = this.exploration.report;

			this.patient = this.exploration.patient;
			if (this.explorationsService.getEditingExploration()) {
				this.state = STATE.EXPLORATION_LOADED;
			} else {
				this.state = STATE.READ_ONLY;
			}
			this.setReportType(this.report.type);
		} else {
			this.report = new Report();
			this.setReportType("FILE");
			this.patient = new Patient();
			this.state = STATE.NOT_LOADED;
		}
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

	ngAfterViewChecked() {
		if (this.getReportType() == "MANUAL" && !this.isDisabled()) {
			document.getElementsByClassName("applyDate")[0].textContent = this.localizationService.translate("Apply");
		 	document.getElementsByClassName("cancelDate")[0].textContent = this.localizationService.translate("Cancel");
		}
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
		this.reportEvent.emit({
			report: this.report,
			patient: this.patient
		});
		this.state = STATE.NOT_LOADED;
	}

	public onPaste(event: Event): void {
		if (navigator.clipboard) {
			navigator.clipboard.readText()
				.then(text => {
					text = text.replace(/(\r\n|\n|\r)/gm, " ");
					this.loadFieldsReport(text);

					if (this.baseReport != undefined && this.baseReport.reportNumber != this.report.reportNumber) {
						this.reportsService.getReportBy(this.report.reportNumber).subscribe(report => {
							this.removeReport();
							this.notificationService.error("The report is already assigned to an exploration", "Report loaded failed");
						}, () => {
							this.notificationService.success("The file has the correct format", "Report upload successfull");
							this.state = STATE.CLIPBOARD_LOADED;
						});
					} else {
						this.notificationService.success("The file has the correct format", "Report upload successfull");
						this.state = STATE.CLIPBOARD_LOADED;
					}
				})
				.catch(error => {
					this.notificationService.error("The copied report has not the correct format", "Report loaded failed")
				});
		} else {
			this.notificationService.error("The clipboard is not enabled", "Failed to access the clipboard")
		}
	}

	public expandReport() {
		if (document.getElementById("dataReport").className.includes("open")) {
			document.getElementById("dataReport").className = document.getElementById("dataReport").className.replace(" open", "");
			document.getElementById("expandControl").className = "las la-eye-slash la-lg";
		} else {
			document.getElementById("dataReport").className += " open";
			document.getElementById("expandControl").className = "las la-eye la-lg";
		}
	}

	public checkState(state: string): boolean {
		return this.state == EnumUtils.findKeyForValue(STATE, state);
	}

	public isDisabled(): boolean {
		return !this.isEditing && this.explorationsService.getExplorationId() != undefined;
	}

	public update(): void {
		this.reportEvent.emit({
			report: this.report,
			patient: this.patient
		});
	}

	public getReportType(): string {
		return this.report.type;
	}

	public setReportType(type: string): void {
		this.report.type = type;
		this.update();
	}

	public applyDate(): void {

	}

	public selectedDate(value: any): void {
		this.patient.birthdate = new Date(value.start);
		this.update();
	}

	public cancelDate(): void {
		this.patient.birthdate = undefined;
		this.update();
	}

	public showReport(type: string): boolean {
		return type === this.report.type;
	}

	public ngOnDestroy(): void {
		this.subscriptionReport.unsubscribe();
	}

	private loadReport(file: File): void {
		if (file != undefined) {
			let fr = new FileReader();
			fr.onload = async (e) => {
				var pdfBase64 = atob(fr.result.toString().split(',')[1]);
				let report = await this.getDocument(pdfBase64);
				this.loadFieldsReport(report);

				if (this.baseReport != undefined && this.baseReport.reportNumber != this.report.reportNumber) {
					this.reportsService.getReportBy(this.report.reportNumber).subscribe(report => {
						this.removeReport();
						this.notificationService.error("The report is already assigned to an exploration", "File upload failed");
					}, () => {
						this.notificationService.success("The file has the correct format", "File upload successfull");
						this.state = STATE.FILE_LOADED;
					});
				} else {
					this.notificationService.success("The file has the correct format", "File upload successfull");
					this.state = STATE.FILE_LOADED;
				}
			}
			fr.readAsDataURL(file);
		}
	}

	private loadFieldsReport(report: any): void {

		report = report.replace(/\s+/g, " ");
		let dictRegex = {};

		dictRegex["regexCIP"] = /(?:CIP:\s+)([0-9A-Z]+)(?: )/;
		dictRegex["regexBirthdate"] = /(?:Data Nac:\s+)([0-9 ]+\/[0-9 ]+\/[0-9 ]+)(?: Sexo:)/;
		dictRegex["regexSex"] = /(?:Sexo:\s+)([a-zA-ZÀ-ÿÑñ]+)(?: NHC:)/;
		dictRegex["regexCompetionDate"] = /(?:Data Realización\s+)([0-9 ]+\/[0-9 ]+\/[0-9 ]+)/;
		dictRegex["regexReportN"] = /(?:Informe Nº\s+)([0-9]+)/;
		dictRegex["regexApplicant"] = /(?:SOLICITANTE Centro\/Servizo\s+)([[a-zA-Z0-9À-ÿÑñ.\/ -]+)(?: Médico)/;
		dictRegex["regexPriority"] = /(?:Prioridade\s+)([a-zA-Z0-9À-ÿÑñ]+)(?: )/;
		dictRegex["regexBed"] = /(?:Cama\s+)([a-zA-ZÀ-ÿÑñ0-9]+)/;
		dictRegex["regexStatus"] = /(?:Prioridade [a-zA-Z0-9À-ÿÑñ]+\s+)([a-zA-Z0-9À-ÿÑñ]+)(?: )/;
		dictRegex["regexRequestedExplorations"] = /(?:EXPLORACIÓNS SOLICITADAS Código Descrición Data )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, -]+) ([0-9]+\s+\/\s+[0-9]+\s+\/\s+[0-9]+) ?)+)(?:\s+(DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE)|(EXPLORACIÓNS REALIZADAS))/;
		dictRegex["regexIndividualRequestedExplorations"] = /([0-9]+\s+[a-zA-ZÀ-ÿÑñ\/, -]+\s+[0-9]+\s+\/\s+[0-9]+\s+\/\s+[0-9]+(?:\s+?))/;
		dictRegex["regexExplorationsCode"] = /([0-9]+)/;
		dictRegex["regexExplorationsDescription"] = /([a-zA-ZÀ-ÿÑñ\/, -]+)/;
		dictRegex["regexExplorationsDate"] = /([0-9]+\s+\/\s+[0-9]+\s+\/\s+[0-9]+)/;
		dictRegex["regexExplorationsPortable"] = /([NS]{1}(?=\s+[NS]))/;
		dictRegex["regexExplorationsSurgery"] = /((?=[NS]\s+)[NS]{1})/;
		dictRegex["regexPerformedExplorations"] = /(?:EXPLORACIÓNS REALIZADAS Código Descrición Data Portátil Quirófano )((([0-9]+) ([a-zA-ZÀ-ÿÑñ\/, -]+) ([0-9]+\s+\/\s+[0-9]+\s+\/\s+[0-9]+) ([NS]) ([NS]) ?)+)(?:\s+(DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA)|(ACHADOS))/;
		dictRegex["regexIndividualPerformedExplorations"] = /([0-9]+\s+[a-zA-ZÀ-ÿÑñ\/, -]+\s+[0-9]+\s+\/\s+[0-9]+\s+\/\s+[0-9]+\s+[NS]\s+[NS](?:\s+?))/;
		dictRegex["regexClinicalData"] = /(?:(?:DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA DA SOLICITUDE )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: EXPLORACIÓNS REALIZADAS ))|(?:(?:DATOS CLÍNICOS\/SOSPEITA DIAGNÓSTICA )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: ACHADOS))/;
		dictRegex["regexFindings"] = /(?:ACHADOS\s+)([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?:(?:\s+CONCLUSIÓNS)|(?:\s+Paciente.*(?=Paciente)))/;
		dictRegex["regexConclusions"] = /(?:CONCLUSIÓNS )([a-zA-Z0-9À-ÿÑñ\s!"#$%&'()*+,\\.\/:;<=>?@[\]^_`{|}~-]+)(?: RADIÓLOGO)/;

		// const regexDoctor = /(?:Médico )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: PACIENTE)/;
		// const regexRadiologist = /(?:RADIÓLOGO\/A )([a-zA-Z0-9À-ÿÑñ.ºª -]+ )/;
		// const regexPatient = /(?:Paciente: )([a-zA-Z0-9À-ÿÑñ.ºª -]+)(?: Data Nac:)/;
		// const regexNHC = /(?:NHC: )([0-9]+)(?: CIP:)/;
		// const regexNSS = /(?:NSS: )([0-9\/]+)(?:  Enderezo:)/;
		// const regexAddress = /(?:Enderezo: )([a-zA-Z0-9À-ÿÑñ.ºª ()-]+)(?: Teléfono:)/;
		// const regexPhoneNumber = /(?:Teléfono: )([0-9]+)/;

		this.patient = new Patient();

		this.patient.patientID = report.match(dictRegex["regexCIP"])[1];
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

		if (report.match(dictRegex["regexBed"]) === null) {
			this.report.bed = "";
		} else {
			this.report.bed = report.match(dictRegex["regexBed"])[1];
		}

		let splitRequestedExplorations = report.match(dictRegex["regexRequestedExplorations"])[1]
			.trim()
			.split(dictRegex["regexIndividualRequestedExplorations"])
			.filter(function (e: string) { return e != ""; });

		let requestedExplorations: RequestedExploration[] = [];

		for (let i = 0; i < splitRequestedExplorations.length; i++) {
			let requestedExploration = new RequestedExploration();

			requestedExploration.code = splitRequestedExplorations[i].match(dictRegex["regexExplorationsCode"])[0]
			requestedExploration.description = splitRequestedExplorations[i].match(dictRegex["regexExplorationsDescription"])[0]
			let completionDate = splitRequestedExplorations[i].match(dictRegex["regexExplorationsDate"])[0]
				.trim()
				.replace(/[\t ]+/g, "")
				.split("/");
			requestedExploration.date = new Date(completionDate[2], completionDate[1] - 1, completionDate[0]);

			requestedExplorations[i] = requestedExploration;
		}

		this.report.requestedExplorations = requestedExplorations;

		if (report.match(dictRegex["regexClinicalData"])[1] != undefined) {
			this.report.clinicalData = report.match(dictRegex["regexClinicalData"])[1];
		} else {
			this.report.clinicalData = report.match(dictRegex["regexClinicalData"])[2];
		}

		let splitPerformedExplorations = report.match(dictRegex["regexPerformedExplorations"])[1]
			.trim()
			.split(dictRegex["regexIndividualPerformedExplorations"])
			.filter(function (e) { return e != ""; });

		let performedExplorations: PerformedExploration[] = []

		for (let i = 0; i < splitPerformedExplorations.length; i++) {
			let performedExploration = new PerformedExploration();

			performedExploration.code = splitPerformedExplorations[i].match(dictRegex["regexExplorationsCode"])[0]
			performedExploration.description = splitPerformedExplorations[i].match(dictRegex["regexExplorationsDescription"])[0]
			let completionDate = splitPerformedExplorations[i].match(dictRegex["regexExplorationsDate"])[0]
				.trim()
				.replace(/[\t ]+/g, "")
				.split("/");
			performedExploration.date = new Date(completionDate[2], completionDate[1] - 1, completionDate[0]);
			performedExploration.portable = splitPerformedExplorations[i].match(dictRegex["regexExplorationsPortable"])[0];
			performedExploration.surgery = splitPerformedExplorations[i].match(dictRegex["regexExplorationsSurgery"])[0];

			performedExplorations[i] = performedExploration;
		}

		this.report.performedExplorations = performedExplorations;
		this.report.findings = report.match(dictRegex["regexFindings"])[1];

		if (report.match(dictRegex["regexConclusions"]) === null) {
			this.report.conclusions = "";
		} else {
			this.report.conclusions = report.match(dictRegex["regexConclusions"])[1];
		}
		this.setReportType("FILE");
		this.reportEvent.emit({
			report: this.report,
			patient: this.patient
		});
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
}
