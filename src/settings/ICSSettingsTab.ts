import ICSPlugin from "../main";
import {
	PluginSettingTab,
	Setting,
	App,
	ButtonComponent,
	Modal,
	TextComponent,
	MarkdownRenderer,
} from "obsidian";

import {
	Calendar
} from "./ICSSettings";

export function getCalendarElement(
	icsName: string): HTMLElement {
	let calendarElement, titleEl;

	calendarElement = createDiv({
		cls: `calendar calendar-${icsName}`,
	});
	titleEl = calendarElement.createEl("summary", {
		cls: `calendar-name ${icsName}`,
		text: icsName
	});

	return calendarElement;
}

export default class ICSSettingsTab extends PluginSettingTab {
	plugin: ICSPlugin;

	constructor(app: App, plugin: ICSPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {
			containerEl
		} = this;

		containerEl.empty();

		const calendarContainer = containerEl.createDiv(
			"ics-setting-calendar"
		);
		new Setting(calendarContainer)
			.setName("Add new")
			.setDesc("Add a new calendar")
			.addButton((button: ButtonComponent): ButtonComponent => {
				let b = button
					.setTooltip("Add Additional")
					.setButtonText("+")
					.onClick(async () => {
						let modal = new SettingsModal(this.app);

						modal.onClose = async () => {
							if (modal.saved) {
								this.plugin.addCalendar({
									icsName: modal.icsName,
									icsUrl: modal.icsUrl,
									format: modal.format
								});
								this.display();
							}
						};

						modal.open();
					});

				return b;
			});

		const additional = calendarContainer.createDiv("calendar");
		for (let a in this.plugin.data.calendars) {
			const calendar = this.plugin.data.calendars[a];

			let setting = new Setting(additional);

			let calEl = getCalendarElement(
				calendar.icsName);
			setting.infoEl.replaceWith(calEl);

			setting
				.addExtraButton((b) => {
					b.setIcon("pencil")
						.setTooltip("Edit")
						.onClick(() => {
							let modal = new SettingsModal(this.app, calendar);

							modal.onClose = async () => {
								if (modal.saved) {
									this.plugin.removeCalendar(calendar);
									this.plugin.addCalendar({
										icsName: modal.icsName,
										icsUrl: modal.icsUrl,
										format: modal.format
									});
									this.display();
								}
							};

							modal.open();
						});
				})
				.addExtraButton((b) => {
					b.setIcon("trash")
						.setTooltip("Delete")
						.onClick(() => {
							this.plugin.removeCalendar(calendar);
							this.display();
						});
				});
		}
	}
}

class SettingsModal extends Modal {
	icsName: string = "";
	icsUrl: string = "";

	saved: boolean = false;
	error: boolean = false;
    format: {
        icsName: boolean,
        summary: boolean,
        description: boolean
    }={
		icsName: true,
        summary: true,
        description: true
	};
	constructor(app: App, setting?: Calendar) {
		super(app);
		if (setting) {
			this.icsName = setting.icsName;
			this.icsUrl = setting.icsUrl;
			this.format = setting.format || this.format // if format is undefined, use default
		}
	}

	display() {
		let {
			contentEl
		} = this;

		contentEl.empty();

		const settingDiv = contentEl.createDiv();

		let nameText: TextComponent;
		const nameSetting = new Setting(settingDiv)
			.setName("Calendar Name")

			.addText((text) => {
				nameText = text;
				nameText.setValue(this.icsName).onChange((v) => {
					this.icsName = v;
				});
			});

		let urlText: TextComponent;
		const urlSetting = new Setting(settingDiv)
			.setName("Calendar URL")

			.addText((text) => {
				urlText = text;
				urlText.setValue(this.icsUrl).onChange((v) => {
					this.icsUrl = v;
				});
			});

        const formatSetting = new Setting(settingDiv)
            .setName("Output Format");

        const icsNameSetting = new Setting(settingDiv)
            .setName('icsName')
            .setDesc('Include the icsName field in the output')
            .addToggle(toggle => toggle
                .setValue(this.format.icsName || false)
                .onChange(value => this.format.icsName = value));

        const summaryName = new Setting(settingDiv)
            .setName('summary')
            .setDesc('Include the summary field in the output')
            .addToggle(toggle => toggle
                .setValue(this.format.summary || false)
                .onChange(value => {
                    this.format.summary = value;
                    console.log("this.format.summary : ", this.format.summary)
                }));

        const dscSetting = new Setting(settingDiv)
            .setName('description')
            .setDesc('Include the description field in the output')
            .addToggle(toggle => toggle
                .setValue(this.format.description || false)
                .onChange(value => this.format.description = value));
		let footerEl = contentEl.createDiv();
		let footerButtons = new Setting(footerEl);
		footerButtons.addButton((b) => {
			b.setTooltip("Save")
				.setIcon("checkmark")
				.onClick(async () => {
					this.saved = true;
					this.close();
				});
			return b;
		});
		footerButtons.addExtraButton((b) => {
			b.setIcon("cross")
				.setTooltip("Cancel")
				.onClick(() => {
					this.saved = false;
					this.close();
				});
			return b;
		});
	}
	onOpen() {
		this.display();
	}

	static setValidationError(textInput: TextComponent, message?: string) {
		textInput.inputEl.addClass("is-invalid");
		if (message) {
			textInput.inputEl.parentElement.addClasses([
				"has-invalid-message",
				"unset-align-items"
			]);
			textInput.inputEl.parentElement.parentElement.addClass(
				".unset-align-items"
			);
			let mDiv = textInput.inputEl.parentElement.querySelector(
				".invalid-feedback"
			) as HTMLDivElement;

			if (!mDiv) {
				mDiv = createDiv({
					cls: "invalid-feedback"
				});
			}
			mDiv.innerText = message;
			mDiv.insertAfter(textInput.inputEl, null);
		}
	}
	static removeValidationError(textInput: TextComponent) {
		textInput.inputEl.removeClass("is-invalid");
		textInput.inputEl.parentElement.removeClasses([
			"has-invalid-message",
			"unset-align-items"
		]);
		textInput.inputEl.parentElement.parentElement.removeClass(
			".unset-align-items"
		);

		if (textInput.inputEl.parentElement.children[1]) {
			textInput.inputEl.parentElement.removeChild(
				textInput.inputEl.parentElement.children[1]
			);
		}
	}
}
